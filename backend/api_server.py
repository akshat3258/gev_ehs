"""
GEV EHS Prediction API - FastAPI Backend
=====================================
Local inference without Databricks dependencies.
"""

import io
import re
import datetime
import logging

import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from theme_keywords import THEME_KEYWORDS, THEMES

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gev-ehs-api")

app = FastAPI(title="GEV EHS Prediction API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "GEV EHS API running"}


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/debug")
async def debug():
    return {
        "backend": "running",
        "themes_count": len(THEMES),
        "theme_keywords_count": len(THEME_KEYWORDS),
    }


@app.post("/api/predict-local")
async def predict_local(file: UploadFile = File(...)):
    try:
        content = await file.read()
        logger.info(f"Received file: {file.filename}, size: {len(content)} bytes")
    except Exception as e:
        logger.error(f"Failed to read file: {e}")
        raise HTTPException(400, f"Failed to read file: {e}")

    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        logger.error(f"Failed to parse CSV: {e}")
        raise HTTPException(400, f"Could not parse CSV: {e}")

    logger.info(f"Parsed {len(df)} rows, columns: {list(df.columns)}")

    required_cols = ["incident_task_desc", "location_nme"]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        logger.error(f"Missing columns: {missing}")
        raise HTTPException(400, f"Missing required columns: {missing}")

    try:
        results = run_local_inference(df)
        logger.info(f"Inference complete: {len(results['sites'])} sites scored")
    except Exception as e:
        logger.error(f"Inference failed: {e}")
        raise HTTPException(500, f"Inference failed: {e}")

    return JSONResponse(content={
        "status": "success",
        "upload_id": "local",
        "input_rows": len(df),
        "sites_scored": len(results["sites"]),
        "results": results,
    })


def run_local_inference(df):
    def classify_row(text):
        if not isinstance(text, str):
            return []
        matched = []
        for theme, pattern in THEME_KEYWORDS.items():
            if re.search(pattern, text, re.IGNORECASE):
                matched.append(theme)
        return matched

    df["_themes"] = df["incident_task_desc"].apply(classify_row)

    sites = {}
    for _, row in df.iterrows():
        loc = row.get("location_nme", "Unknown")
        if loc not in sites:
            sites[loc] = {
                "site_key": loc,
                "themes": set(),
                "stopwork_count": 0,
                "dates": [],
            }
        for t in row["_themes"]:
            sites[loc]["themes"].add(t)
        ct = str(row.get("concern_type", "")).lower()
        if "stop work" in ct or "stopwork" in ct:
            sites[loc]["stopwork_count"] += 1
        dt = row.get("incident_reported_dt")
        if pd.notna(dt):
            try:
                sites[loc]["dates"].append(pd.to_datetime(dt))
            except:
                pass

    now = datetime.datetime.now()
    site_results = []

    for name, s in sites.items():
        count = len([r for r in df.itertuples() if r.location_nme == name])
        themes_covered = len(s["themes"])
        blind_spots = 21 - themes_covered
        blind_spot_names = [t for t in THEMES if t not in s["themes"]]
        stopwork_rate = s["stopwork_count"] / max(count, 1)
        sorted_dates = sorted(s["dates"], reverse=True)
        days_since = (now - sorted_dates[0]).days if sorted_dates else 999

        score = 0.04
        if days_since > 60:
            score += 0.12
        elif days_since > 30:
            score += 0.06
        score += (blind_spots / 21) * 0.08
        if count <= 2:
            score += 0.06
        elif count <= 5:
            score += 0.03
        if stopwork_rate == 0:
            score += 0.03
        if themes_covered >= 10:
            score -= 0.04
        if stopwork_rate > 0.15:
            score -= 0.03
        if count >= 20:
            score -= 0.02
        score = max(0.01, min(0.40, score))

        if score >= 0.15:
            tier = "HIGH"
        elif score >= 0.08:
            tier = "ELEVATED"
        elif score >= 0.05:
            tier = "MODERATE"
        else:
            tier = "LOW"

        explanations = []
        if days_since > 30:
            explanations.append({"text": f"No concerns in {days_since} days", "risk": True})
        if blind_spots > 10:
            explanations.append({"text": f"{blind_spots} of 21 themes uncovered", "risk": True})
        if count < 3:
            explanations.append({"text": f"Only {count} concerns - very low", "risk": True})
        if stopwork_rate == 0 and count > 0:
            explanations.append({"text": "Zero stop-work actions", "risk": True})
        if themes_covered >= 10:
            explanations.append({"text": f"{themes_covered} themes monitored", "risk": False})
        if not explanations:
            explanations.append({"text": "Moderate activity", "risk": True})

        site_results.append({
            "site_key": name,
            "risk_score": round(score, 4),
            "risk_tier": tier,
            "concern_count": count,
            "themes_covered": themes_covered,
            "blind_spot_count": blind_spots,
            "blind_spot_themes": blind_spot_names,
            "explanations": explanations,
            "stopwork_rate": round(stopwork_rate, 3),
            "days_since_last_concern": days_since,
            "concern_trend_mom": 0,
        })

    site_results.sort(key=lambda x: x["risk_score"], reverse=True)

    theme_gaps = {}
    for s in site_results:
        for t in s["blind_spot_themes"]:
            theme_gaps[t] = theme_gaps.get(t, 0) + 1

    return {
        "sites": site_results,
        "theme_gaps": theme_gaps,
        "tier_counts": {
            "HIGH": sum(1 for s in site_results if s["risk_tier"] == "HIGH"),
            "ELEVATED": sum(1 for s in site_results if s["risk_tier"] == "ELEVATED"),
            "MODERATE": sum(1 for s in site_results if s["risk_tier"] == "MODERATE"),
            "LOW": sum(1 for s in site_results if s["risk_tier"] == "LOW"),
        },
    }


if __name__ == "__main__":
    import uvicorn
    print("Starting GEV EHS API on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)