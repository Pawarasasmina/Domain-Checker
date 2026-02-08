# 🛡️ URL Detector - Indonesian Blocked URL Detection System

A comprehensive web application for detecting blocked URLs in Indonesia using both live ISP checks and official Trust Positif database verification. Features automated scanning, real-time notifications, and a powerful admin dashboard.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Admin Panel](#admin-panel)
- [External API Integration](#external-api-integration)
- [Telegram Notifications](#telegram-notifications)
- [Development](#development)
- [Production Deployment](#production-deployment)

---

## 🎯 Overview

The URL Detector system provides multiple methods to check if URLs are blocked in Indonesia:

1. **Live Check** - Real-time ISP block detection by analyzing HTTP responses
2. **Official DB Check** - Verification against Trust Positif government database
3. **Dual Check** - Simultaneous checking using both methods for comprehensive results
4. **Automated Scanning** - Background service that periodically fetches and checks URLs from external API
5. **Bulk API** - RESTful API endpoint for programmatic URL checking with API key authentication

The system includes Telegram integration for instant notifications and a secure admin panel for monitoring and configuration.

---

## ✨ Features

### 🔍 URL Checking Modes

- **Single URL Check** - Check one URL at a time with immediate results
- **Bulk URL Check** - Check multiple URLs simultaneously (up to 100+)
- **Live Detection** - Smart ISP block page detection for Indonesian providers (Telkomsel, XL, Indosat, etc.)
- **Official Database** - Direct queries to Trust Positif official database
- **Dual Verification** - Compare results from both live and official sources

### 🤖 Automation System

- **Scheduled Scanning** - Automatic URL checking at configurable intervals
- **External API Integration** - Fetch URLs from external source automatically
- **Result Reporting** - Send scan results back to external API
- **Force Stop** - Manual override to stop automation when needed
- **Real-time Monitoring** - Live status updates via WebSocket

### 📱 Telegram Notifications

- **Configurable Alerts** - Choose which events trigger notifications
- **Scan Start Alerts** - Get notified when automated scans begin
- **Blocked URL Alerts** - Instant alerts when blocked URLs are detected
- **CSV Reports** - Receive complete scan reports as CSV attachments
- **Scan Completion** - Summary notifications with statistics
- **Test Functionality** - Verify bot configuration with test messages

### 🎛️ Admin Dashboard

- **Automation Monitor** - View and control automated scanning
- **Scan Logs Viewer** - Real-time log streaming with pagination (30 records per page)
- **Settings Management** - Configure Telegram bot and notification preferences
- **Secure Authentication** - JWT-based admin login system
- **Statistics Dashboard** - View scan history and statistics

### 📊 History & Analytics

- **Scan History** - Complete record of all URL checks
- **Statistics** - Total scans, blocked URLs, accessible URLs, errors
- **Detailed Reports** - View individual scan results with timestamps
- **Export Options** - Download results as CSV or JSON
- **Delete Functionality** - Clean up old scan records

### 🔌 Bulk Check API

- **API Key Authentication** - Secure access with `API_SECURE_KEY`
- **Multiple Modes** - Support for live, official, and dual checking
- **Bulk Processing** - Check multiple URLs in single request
- **Response Time Tracking** - Individual URL check duration
- **Separate Logging** - Dedicated `api_check_logs` collection
- **Admin Management** - View and clear API check logs from admin panel

---

## 🏗️ Architecture

(Continued in full documentation above)

---

## 📞 Support

For issues, questions, or contributions:

- **Repository:** https://github.com/----/blocked-url-detector
- **Owner:** enoshrodrigo

---

****
