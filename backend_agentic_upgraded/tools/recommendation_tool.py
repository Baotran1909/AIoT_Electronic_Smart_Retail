from retrieval.hybrid_retriever import retrieve_knowledge


def recommend_by_project(project_description: str) -> str:
    return retrieve_knowledge(project_description, top_k=5)
