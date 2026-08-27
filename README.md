# OpenKBCore

> Open-source knowledge base and RAG engine for building grounded AI applications and agents.

## Overview

OpenKBCore is an open-source Knowledge Base and Retrieval-Augmented Generation (RAG) engine designed to provide reusable knowledge infrastructure for AI applications and agents.

The project focuses on document ingestion, processing, indexing, retrieval, reranking, knowledge management, and grounding AI responses with reliable sources.

## Vision

OpenKBCore aims to provide a reusable knowledge layer that can be used by different AI applications and agents.

```text
                    OpenKBCore
                        |
              +---------+---------+
              |                   |
              v                   v
          Knowledge           Retrieval
          Management            Engine
              |                   |
              +---------+---------+
                        |
                        v
                   AI / Agents
```

## Supported Knowledge Sources

Planned support includes:

- PDF
- DOCX
- Markdown
- HTML
- Websites
- Git repositories
- APIs
- Databases
- User-provided documents

## Core Pipeline

```text
Data Sources
     ↓
Ingestion
     ↓
Parsing
     ↓
Chunking
     ↓
Metadata
     ↓
Embedding
     ↓
Indexing
     ↓
Retrieval
     ↓
Reranking
     ↓
Context
     ↓
LLM / Agent
```

## Retrieval

### Initial

- Vector search
- Metadata filtering

### Advanced

- BM25
- Hybrid search
- Query rewriting
- Multi-query retrieval
- Reranking
- Parent-child retrieval
- Contextual retrieval
- Graph-based retrieval
- GraphRAG

## Knowledge Management

Planned capabilities:

- Knowledge bases
- Collections
- Documents
- Document versions
- Metadata
- Tags
- Namespaces
- Permissions
- Access control
- Multi-tenancy

## Grounded AI

OpenKBCore is designed to help AI systems provide answers based on retrieved knowledge rather than relying only on the model's internal knowledge.

Planned features:

- Source citations
- Retrieved-context inspection
- Citation tracking
- Retrieval transparency
- Answer grounding

## AI Concepts

- RAG
- Embeddings
- Vector databases
- Semantic search
- Keyword search
- Hybrid search
- Reranking
- Query rewriting
- Contextual retrieval
- GraphRAG
- Knowledge graphs
- RAG evaluation

## Planned Technology Stack

- Python
- FastAPI
- LlamaIndex
- LangGraph
- PostgreSQL
- pgvector
- Redis
- Docker
- AWS

## Architecture

```text
                    OpenKBCore
                        |
             +----------+----------+
             |                     |
             v                     v
        Ingestion Layer       Knowledge API
             |                     |
             v                     |
        Processing Layer           |
             |                     |
             v                     |
        Indexing Layer             |
             |                     |
     +-------+-------+             |
     |       |       |             |
     v       v       v             |
  Vector   BM25   Graph            |
  Search   Search Search           |
     |       |       |             |
     +-------+-------+-------------+
                     |
                     v
                Reranking
                     |
                     v
                Context API
                     |
                     v
                AI / Agents
```

## Integration

OpenKBCore is designed to become a shared knowledge layer for other AI projects.

Potential integrations:

```text
OpenKBCore
    |
    +-- OpenJobAgent
    |
    +-- OpenLearnAgent
    |
    +-- OpenSWEAgent
    |
    +-- Other AI Applications
```

## Roadmap

### Phase 1 - Basic RAG

- Document ingestion
- PDF support
- Chunking
- Embeddings
- pgvector
- Basic vector search

### Phase 2 - Knowledge Management

- Metadata
- Collections
- Document management
- Document versions
- Knowledge Base API

### Phase 3 - Advanced Retrieval

- BM25
- Hybrid search
- Query rewriting
- Reranking
- Multi-query retrieval

### Phase 4 - Enterprise

- Multi-tenancy
- Permissions
- Access control
- Authentication
- Authorization

### Phase 5 - Advanced Knowledge

- Knowledge graphs
- GraphRAG
- Entity extraction
- Relationship extraction

### Phase 6 - Evaluation

- Retrieval evaluation
- RAG evaluation
- Groundedness evaluation
- Dataset management
- Quality metrics

### Phase 7 - Production

- Observability
- Performance optimization
- Caching
- Distributed processing
- AWS deployment

## Project Status

🚧 Early development

## License

MIT
