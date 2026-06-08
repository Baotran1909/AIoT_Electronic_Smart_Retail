from retrieval.hybrid_retriever import retrieve_knowledge


def compare_components(component_a: str, component_b: str) -> str:
    knowledge_a = retrieve_knowledge(component_a, top_k=3)
    knowledge_b = retrieve_knowledge(component_b, top_k=3)
    return f"""
THÔNG TIN LINH KIỆN A: {component_a}
{knowledge_a[:1800]}

THÔNG TIN LINH KIỆN B: {component_b}
{knowledge_b[:1800]}
"""
