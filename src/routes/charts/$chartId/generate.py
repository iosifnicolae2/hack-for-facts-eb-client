import json
import uuid
import urllib.parse
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

def generate_urls(
    entity_cuis: List[str],
    account_category: str = 'ch',
    chart_type: str = 'bar',
    title: Optional[str] = None,
    description: Optional[str] = None,
    start_year: int = 2016,
    end_year: int = 2025, # current year
    economic_prefixes: Optional[List[str]] = None,
    functional_prefixes: Optional[List[str]] = None,
    entity_types: Optional[List[str]] = None
) -> Dict[str, Optional[str]]:
    """
    Generates a dictionary of URLs for public finance data visualization based on the new schema.

    Args:
        entity_cuis: A list of Fiscal Identification Codes (CUI/CIF).
        account_category: 'ch' for spending (default), 'vn' for revenue.
        chart_type: 'bar' (default), 'line', or 'area'.
        title: Optional title for the chart. If None, a title is auto-generated.
        description: Optional description for the chart.
        start_year: The start year for the data range.
        end_year: The end year for the data range.
        economic_prefixes: Optional list of economic COFOG3 prefixes.
        functional_prefixes: Optional list of functional COFOG3 prefixes.
        entity_types: Optional list of entity types.

    Returns:
        A dictionary containing 'chart_url' and 'entity_url'.
    """
    base_url = "http://localhost:5173"
    chart_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()

    # --- Construct the Series Filter (AnalyticsFilterSchema) ---
    series_filter = {
        "account_category": account_category,
        "entity_cuis": entity_cuis,
    }
    if economic_prefixes:
        series_filter["economic_prefixes"] = economic_prefixes
    if functional_prefixes:
        series_filter["functional_prefixes"] = functional_prefixes
    if entity_types:
        series_filter["entity_types"] = entity_types

    # --- Auto-generate Title and Label if not provided ---
    if not title:
        data_type_str = "Spending" if account_category == 'ch' else "Revenue"
        entity_str = f"Entity {entity_cuis[0]}" if len(entity_cuis) == 1 else f"{len(entity_cuis)} Entities"
        title = f"Total {data_type_str} for {entity_str} ({start_year}-{end_year})"
    
    series_label = "Total " + ("Spending" if account_category == 'ch' else "Revenue")

    # --- Construct the main chart state object (aligns with ChartSchema) ---
    chart_object = {
        "id": chart_id,
        "title": title,
        "config": {
            "chartType": chart_type,
            "showGridLines": True,
            "showLegend": True,
            "showTooltip": True,
            "editAnnotations": True,
            "showAnnotations": True,
            "yearRange": {"start": start_year, "end": end_year},
        },
        "series": [
            {
                "id": str(uuid.uuid4()),
                "type": "line-items-aggregated-yearly",
                "enabled": True,
                "label": series_label,
                "filter": series_filter,
                "config": {},
                "createdAt": now_iso,
                "updatedAt": now_iso,
            }
        ],
        "annotations": [],
        "createdAt": now_iso,
        "updatedAt": now_iso,
    }

    if description:
        chart_object["description"] = description

    # --- Build Chart URL ---
    encoded_chart = urllib.parse.quote(json.dumps(chart_object, separators=(",", ":")))
    chart_url = f"{base_url}/charts/{chart_id}?chart={encoded_chart}"

    # --- Build Entity URL (for the first CUI only) ---
    entity_url = f"{base_url}/entities/{entity_cuis[0]}" if entity_cuis else None

    return {"chart_url": chart_url, "entity_url": entity_url}

generate_urls(
    entity_cuis=["4270740"],
    account_category="ch",
    chart_type="bar",
    title="Total Spending for the Ministry of Finance",
    description="This chart shows the total spending for the Ministry of Finance from 2016 to 2025.",
)