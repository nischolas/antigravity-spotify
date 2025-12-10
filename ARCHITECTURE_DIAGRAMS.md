# Data Flow Architecture

## System Overview

```mermaid
graph TB
    User[User] -->|Uploads Files| FileUpload[FileUpload Component]
    FileUpload -->|loadData| Store[Zustand Store]

    Store -->|rawData| Views[View Components]
    Store -->|aggregatedData| Views

    Views -->|DataTable| Table[Track Leaderboard]
    Views -->|TimelineView| Timeline[Listening Over Time]
    Views -->|SkipAnalysis| Skip[Skip Behavior]
    Views -->|PlatformView| Platform[Platform Stats]
    Views -->|Future Views| More[More Visualizations...]

    User -->|Reset| Store

    style Store fill:#4CAF50,stroke:#2E7D32,color:#fff
    style FileUpload fill:#2196F3,stroke:#1565C0,color:#fff
    style Views fill:#FF9800,stroke:#E65100,color:#fff
```

## Data Processing Pipeline

```mermaid
graph LR
    A[JSON/ZIP Files] -->|Parse| B[Raw Array]
    B -->|loadData| C[Store: rawData]
    C -->|Aggregate by URI| D[Store: aggregatedData]

    C -->|Read| E[Time-based Views]
    C -->|Read| F[Skip Analysis]
    C -->|Read| G[Platform Views]

    D -->|Read| H[Top Tracks]
    D -->|Read| I[Top Artists]
    D -->|Read| J[Leaderboards]

    style C fill:#4CAF50,stroke:#2E7D32,color:#fff
    style D fill:#4CAF50,stroke:#2E7D32,color:#fff
```

## Component Communication

### Before (Prop Drilling)

```mermaid
graph TD
    App[App Component<br/>useState] -->|onDataLoaded| FileUpload[FileUpload]
    FileUpload -->|callback| App
    App -->|data prop| DataTable[DataTable]

    style App fill:#f44336,stroke:#c62828,color:#fff
```

### After (Zustand Store)

```mermaid
graph TD
    Store[Zustand Store<br/>Single Source of Truth]

    FileUpload[FileUpload] -->|loadData| Store
    Store -->|aggregatedData| DataTable[DataTable]
    Store -->|rawData| NewViews[New Views]
    App[App] -->|reset| Store
    Store -->|aggregatedData.length| App

    style Store fill:#4CAF50,stroke:#2E7D32,color:#fff
```

## Store State Structure

```mermaid
graph TB
    Store[Zustand Store]

    Store --> RawData[rawData: SpotifyHistoryItem<br/>All individual plays]
    Store --> AggData[aggregatedData: SpotifyHistoryItem<br/>Grouped by track URI]
    Store --> Loading[isLoading: boolean]
    Store --> Error[error: string | null]

    Store --> Actions[Actions]
    Actions --> LoadData[loadData]
    Actions --> Reset[reset]
    Actions --> SetRaw[setRawData]
    Actions --> SetAgg[setAggregatedData]

    style Store fill:#4CAF50,stroke:#2E7D32,color:#fff
    style Actions fill:#2196F3,stroke:#1565C0,color:#fff
```

## Data Transformation Flow

```mermaid
graph LR
    A[Upload Files] -->|Parse JSON| B[Raw Items Array]
    B -->|loadData| C{Store Processing}

    C -->|Store as-is| D[rawData]
    C -->|Group by URI| E{Aggregation}

    E -->|Sum ms_played| F[aggregatedData]

    D -->|Time series| G[Timeline Views]
    D -->|Individual events| H[Skip Analysis]
    D -->|Session data| I[Listening Patterns]

    F -->|Total playtime| J[Top Tracks]
    F -->|By artist| K[Top Artists]

    style C fill:#4CAF50,stroke:#2E7D32,color:#fff
    style E fill:#FF9800,stroke:#E65100,color:#fff
```

## View Component Pattern

```mermaid
graph TB
    View[View Component]

    View -->|useSpotifyStore| Store[Zustand Store]
    Store -->|rawData or aggregatedData| View

    View -->|useMemo| Transform[Data Transformation]
    Transform -->|Filtered/Grouped| Display[Render Visualization]

    style Store fill:#4CAF50,stroke:#2E7D32,color:#fff
    style Transform fill:#FF9800,stroke:#E65100,color:#fff
```

## Planned Visualizations Map

```mermaid
mindmap
  root((Spotify<br/>Visualizer))
    Time Analysis
      Line Chart: Daily/Weekly/Monthly
      Heatmap: Hour × Weekday
      Calendar: GitHub-style
    Top Lists
      Bar Chart: Artists
      Bar Chart: Songs
      Treemap: Genre Distribution
      Pareto: 80/20 Analysis
    Behavior
      Scatter: Playtime vs Skips
      Skip Rate by Artist
      Session Length Analysis
    Platform
      Donut: Device Distribution
      Stacked Bar: Platform Over Time
    Mood/Tempo
      Radar: Audio Features
      Timeline: Mood Changes
    Geographic
      Map: Listening Locations
      Heatmap: Travel Patterns
```
