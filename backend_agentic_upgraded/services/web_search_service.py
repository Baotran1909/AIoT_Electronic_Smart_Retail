from config.settings import TAVILY_API_KEY


def web_fallback_search(query: str) -> str:
    if not TAVILY_API_KEY:
        return "WEB SEARCH DISABLED: thiếu TAVILY_API_KEY."

    try:
        from tavily import TavilyClient
        client = TavilyClient(api_key=TAVILY_API_KEY)
        response = client.search(query=query, search_depth="basic", max_results=3)
        results = response.get("results", [])
        texts = []
        for r in results:
            texts.append(
                f"""
TITLE:
{r.get('title')}

CONTENT:
{r.get('content')}
"""
            )
        return "\n\n".join(texts)
    except Exception as e:
        return f"WEB SEARCH ERROR: {str(e)}"
