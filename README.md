# NagrikLens AI

<p align="center">
  <strong>Citizen Needs. Public Data. Better Decisions.</strong>
</p>

<p align="center">
  An evidence-grounded AI platform for understanding citizen development requests,
  connecting them with public data, and supporting transparent infrastructure prioritisation.
</p>

<p align="center">

![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-Frontend-3178C6?logo=typescript&logoColor=white)
![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?logo=google&logoColor=white)
![FAISS](https://img.shields.io/badge/FAISS-Vector%20Search-0468D7)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-147%20Passing-2ea44f)
![License](https://img.shields.io/badge/License-Prototype-lightgrey)

</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#problem">Problem</a> •
  <a href="#solution">Solution</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#ai-pipeline">AI Pipeline</a> •
  <a href="#installation">Installation</a> •
  <a href="#api-documentation">API</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#testing">Testing</a>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Problem](#problem)
- [Why NagrikLens AI](#why-nagriklens-ai)
- [Solution](#solution)
- [Core Capabilities](#core-capabilities)
- [How the Platform Works](#how-the-platform-works)
- [System Architecture](#system-architecture)
- [AI Pipeline](#ai-pipeline)
- [Citizen Request Intelligence](#citizen-request-intelligence)
- [Multilingual Processing](#multilingual-processing)
- [Public Data Layer](#public-data-layer)
- [Knowledge Ingestion](#knowledge-ingestion)
- [Semantic Search](#semantic-search)
- [Hybrid Retrieval](#hybrid-retrieval)
- [Evidence-Grounded RAG](#evidence-grounded-rag)
- [Priority Assessment](#priority-assessment)
- [Demand Hotspots](#demand-hotspots)
- [Analytics](#analytics)
- [Evidence Provenance](#evidence-provenance)
- [System Monitoring](#system-monitoring)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Application Routes](#application-routes)
- [API Documentation](#api-documentation)
- [Data Model](#data-model)
- [Installation](#installation)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Running the Complete Application](#running-the-complete-application)
- [Example Workflow](#example-workflow)
- [Example Citizen Request](#example-citizen-request)
- [Example Evidence Flow](#example-evidence-flow)
- [Testing](#testing)
- [Security](#security)
- [Deployment](#deployment)
- [Production Architecture](#production-architecture)
- [Deployment Limitations](#deployment-limitations)
- [Responsible AI](#responsible-ai)
- [Evidence and Uncertainty](#evidence-and-uncertainty)
- [Current Dataset Coverage](#current-dataset-coverage)
- [Known Limitations](#known-limitations)
- [Future Roadmap](#future-roadmap)
- [Hackathon Context](#hackathon-context)
- [Demo Flow](#demo-flow)
- [Project Status](#project-status)
- [Team](#team)
- [License](#license)
- [Disclaimer](#disclaimer)

---

# Overview

**NagrikLens AI** is a multilingual citizen development intelligence platform designed to connect citizen-reported infrastructure needs with relevant public data.

The platform accepts development-related requests from citizens through a structured interface and supports English, Hindi, and Gujarati intake.

A submitted request passes through an intelligence pipeline:

```text
Citizen Request
       │
       ▼
Request Validation
       │
       ▼
AI Understanding
       │
       ▼
Structured Problem Representation
       │
       ▼
Public Data Retrieval
       │
       ▼
Semantic + Metadata Search
       │
       ▼
Evidence Collection
       │
       ▼
Evidence-Grounded RAG
       │
       ▼
Transparent Analysis
       │
       ▼
Priority Assessment
       │
       ▼
Hotspots + Analytics
