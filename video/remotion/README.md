# Remotion Showcase Video

Industrial minimal video showcase for `ranker-agentic-workflow`.

## Style
- Palette: black, gray, white, silver
- Direction: industrial, minimalist, technological
- Format: 1920x1080, 30fps

## Compositions
- `RankerWorkflowShowcase` (V1): 20s foundational product demo
- `RankerWorkflowShowcaseV2` (V2): 24s cinematic mission-control style demo
- `RankerWorkflowShowcaseV3` (V3): 24s beat-synced cinematic demo with soundtrack
- `RankerWorkflowShowcaseV3Vertical` (V3 vertical): 24s 9:16 social/mobile version

## Run
```bash
cd video/remotion
npm install
npm run preview
```

## Render
```bash
cd video/remotion
npm run render
npm run render:v2
npm run render:v3
npm run render:v3:vertical
```

Output files:
- `video/remotion/out/ranker-workflow-showcase.mp4`
- `video/remotion/out/ranker-workflow-showcase-v2.mp4`
- `video/remotion/out/ranker-workflow-showcase-v3.mp4`
- `video/remotion/out/ranker-workflow-showcase-v3-vertical.mp4`

Audio file used by V3:
- `video/remotion/public/audio/industrial-pulse-120bpm.wav`
