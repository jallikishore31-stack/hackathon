import os
from apscheduler.schedulers.background import BackgroundScheduler
from scraper import scrape_colleges
import logging

logger = logging.getLogger(__name__)

def start_scheduler(app):
    interval_minutes = int(os.environ.get("SYNC_INTERVAL_MINUTES", "30"))
    scheduler = BackgroundScheduler()
    # Pass the Flask app into the scraper
    scheduler.add_job(
        func=scrape_colleges,
        args=[app],
        trigger="interval",
        minutes=interval_minutes,
        id="scrape_job",
        name=f"Sync Government Data Every {interval_minutes} Minutes",
        replace_existing=True
    )
    scheduler.start()
    logger.info("Scheduler started. Sync will run every %s minutes.", interval_minutes)
    return scheduler
