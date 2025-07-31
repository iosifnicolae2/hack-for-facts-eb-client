
import json
import uuid
from typing import List, Optional, Dict
from datetime import datetime, timezone

def generate_urls(
    title: Optional[str],
    entity_cuis: List[str],
    year: int = 2024,
    account_category: str = 'ch',
    chart_type: str = 'bar',
    description: Optional[str] = None,
    functional_prefixes: Optional[List[str]] = None,
    entity_types: Optional[List[str]] = None
) -> Dict[str, Optional[str]]:
    """
    Generates a dictionary of URLs for public finance data visualization based on the new schema.

    Args:
        title: Provided a meaningful title for the chart.
        entity_cuis: A list of Fiscal Identification Codes (CUI/CIF).
        year: The year for the data. Range is 2016-2024.
        account_category: 'ch' for spending (default), 'vn' for revenue.
        chart_type: 'bar' (default), 'line', or 'area'.
        description: Optional description for the chart.
        functional_prefixes: Optional list of functional prefixes from the functional-classificatinos-general.json file. Example: ["65."] for Education(Invatamant). Use only the valid number for the prefix.
        entity_types: Optional list of entity types from the entity-categories.json file.

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
    if functional_prefixes:
        series_filter["functional_prefixes"] = functional_prefixes
    if entity_types:
        series_filter["entity_types"] = entity_types

    # --- Auto-generate Title and Label if not provided ---
    if not title:
        data_type_str = "Spending" if account_category == 'ch' else "Revenue"
        entity_str = f"Entity {entity_cuis[0]}" if len(entity_cuis) == 1 else f"{len(entity_cuis)} Entities"
        title = f"Total {data_type_str} for {entity_str} "
    
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

    # --- Build Chart URL --- No need for encoding the url, only convert to json string
    chart_url = f"{base_url}/charts/{chart_id}?chart={json.dumps(chart_object)}"

    # --- Build Entity URL (for the first CUI only) ---
    year_str = f"&year={year}" if year else ""
    functional_prefix_str = f"&expenseSearch=fn%3A{functional_prefixes[0]}&incomeSearch=fn%3A{functional_prefixes[0]}" if functional_prefixes and len(functional_prefixes) > 0 else ""
    entity_url = f"{base_url}/entities/{entity_cuis[0]}?ref=chatgpt{year_str}{functional_prefix_str}" if entity_cuis else None

    return {"chart_url": chart_url, "entity_url": entity_url}