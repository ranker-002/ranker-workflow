import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
} from 'remotion';

const palette = {
  black: '#040506',
  dark: '#0a0d11',
  steel: '#1b2128',
  silver: '#c6ccd3',
  white: '#f3f6fb',
  fog: '#828b96',
  line: 'rgba(236, 241, 248, 0.18)',
};

const font = {
  display: 'Rajdhani, Barlow Condensed, Helvetica Neue, sans-serif',
  body: 'IBM Plex Sans, Manrope, Helvetica Neue, sans-serif',
  mono: 'IBM Plex Mono, Space Mono, monospace',
};

const BPM = 120;
const FPS = 30;
const FRAMES_PER_BEAT = (60 / BPM) * FPS;

const beatProgress = (frame: number): number => {
  const withinBeat = frame % FRAMES_PER_BEAT;
  return 1 - withinBeat / FRAMES_PER_BEAT;
};

const metallicPanel: React.CSSProperties = {
  border: `1px solid ${palette.line}`,
  background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.01))',
  boxShadow: '0 24px 72px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.03)',
  backdropFilter: 'blur(10px)',
};

const V3Background: React.FC = () => {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [0, 720], [-1000, 1400]);

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background: `radial-gradient(circle at 18% 14%, ${palette.steel} 0%, ${palette.dark} 36%, ${palette.black} 80%)`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(243,246,251,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(243,246,251,0.05) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          opacity: 0.36,
          maskImage: 'radial-gradient(circle at 50% 35%, black 35%, transparent 86%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(100deg, transparent 0%, rgba(245,249,255,0.1) 42%, transparent 58%)',
          transform: `translateX(${sweep}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const BeatRing: React.FC<{x: number; y: number}> = ({x, y}) => {
  const frame = useCurrentFrame();
  const beat = beatProgress(frame);
  const scale = interpolate(beat, [0, 1], [1.15, 0.8]);
  const opacity = interpolate(beat, [0, 1], [0.15, 0.6]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 220,
        height: 220,
        borderRadius: 999,
        border: `1px solid rgba(243,246,251,${opacity})`,
        transform: `scale(${scale})`,
      }}
    />
  );
};

const TitleCard: React.FC<{portrait?: boolean}> = ({portrait = false}) => {
  const frame = useCurrentFrame();
  const enter = spring({frame, fps: FPS, config: {damping: 16, stiffness: 86}});

  return (
    <AbsoluteFill
      style={{
        padding: portrait ? 56 : 84,
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          ...metallicPanel,
          borderRadius: portrait ? 28 : 32,
          padding: portrait ? '36px 34px' : '50px 60px',
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [50, 0])}px) scale(${interpolate(enter, [0, 1], [0.96, 1])})`,
        }}
      >
        <div
          style={{
            fontFamily: font.mono,
            color: palette.fog,
            textTransform: 'uppercase',
            letterSpacing: 3,
            fontSize: portrait ? 20 : 24,
          }}
        >
          Ranker Workflow // V3 Audio Sync
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: font.display,
            fontWeight: 700,
            textTransform: 'uppercase',
            color: palette.white,
            letterSpacing: 1,
            lineHeight: 0.92,
            fontSize: portrait ? 82 : 108,
          }}
        >
          Precision
          <br />
          Under Rhythm
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: font.body,
            color: palette.silver,
            lineHeight: 1.35,
            maxWidth: portrait ? 700 : 1200,
            fontSize: portrait ? 28 : 34,
          }}
        >
          Structured tasks and skills moving on deterministic timing so even low-capability
          models can deliver complex features with confidence.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CueTimeline: React.FC<{portrait?: boolean}> = ({portrait = false}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 210], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cues = [
    'Brainstorm and scope',
    'oneshot implementation',
    'debug stabilization loop',
    'security and regression gates',
    'PR + commit package',
  ];

  return (
    <AbsoluteFill style={{padding: portrait ? 52 : 82}}>
      <div style={{...metallicPanel, borderRadius: 24, padding: portrait ? 28 : 34}}>
        <div
          style={{
            fontFamily: font.display,
            fontSize: portrait ? 60 : 74,
            color: palette.white,
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          Beat-Aligned Pipeline
        </div>
        <div
          style={{
            marginTop: 10,
            color: palette.fog,
            fontFamily: font.mono,
            fontSize: portrait ? 22 : 26,
          }}
        >
          120 BPM timing map // one cycle = one gate
        </div>

        <div style={{marginTop: 24, position: 'relative', height: portrait ? 1080 : 360}}>
          <div
            style={{
              position: 'absolute',
              top: portrait ? 24 : 28,
              left: 8,
              right: 8,
              height: 2,
              background: 'rgba(255,255,255,0.18)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: portrait ? 24 : 28,
              left: 8,
              width: `${Math.max(1, progress * 98)}%`,
              height: 2,
              background: palette.white,
            }}
          />

          {cues.map((cue, i) => {
            const t = i / (cues.length - 1);
            const active = progress >= t;
            const rowTop = portrait ? 50 + i * 190 : 50;
            const cueLeft = portrait ? 22 : `calc(${t * 100}% - 10px)`;

            return (
              <div
                key={cue}
                style={{
                  position: 'absolute',
                  left: cueLeft,
                  top: rowTop,
                  width: portrait ? '88%' : 330,
                  opacity: active ? 1 : 0.45,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    background: active ? palette.white : palette.fog,
                    boxShadow: active ? '0 0 0 5px rgba(255,255,255,0.15)' : 'none',
                  }}
                />
                <div
                  style={{
                    marginTop: 16,
                    color: palette.silver,
                    fontFamily: font.body,
                    fontSize: portrait ? 34 : 30,
                    lineHeight: 1.25,
                  }}
                >
                  {cue}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const QualityHUD: React.FC<{portrait?: boolean}> = ({portrait = false}) => {
  const frame = useCurrentFrame();
  const checks = [
    'Task contract integrity',
    'Implementation correctness',
    'Security gate status',
    'Regression resilience',
    'Release confidence score',
  ];

  return (
    <AbsoluteFill style={{padding: portrait ? 52 : 82, justifyContent: 'center'}}>
      <div style={{...metallicPanel, borderRadius: 24, padding: portrait ? 28 : 34}}>
        <div
          style={{
            fontFamily: font.display,
            color: palette.white,
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: portrait ? 62 : 76,
            letterSpacing: 1,
          }}
        >
          Verification HUD
        </div>

        <div style={{display: 'grid', gap: 12, marginTop: 16}}>
          {checks.map((check, i) => {
            const pulse = interpolate(frame, [i * 10, i * 10 + 16], [0.45, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <div
                key={check}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${palette.line}`,
                  paddingBottom: 10,
                  opacity: pulse,
                }}
              >
                <span style={{fontFamily: font.body, color: palette.silver, fontSize: portrait ? 32 : 31}}>
                  {check}
                </span>
                <span
                  style={{
                    fontFamily: font.mono,
                    color: palette.white,
                    fontSize: portrait ? 30 : 28,
                    letterSpacing: 2,
                  }}
                >
                  PASS
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{portrait?: boolean}> = ({portrait = false}) => {
  const frame = useCurrentFrame();
  const pop = spring({frame, fps: FPS, config: {damping: 15, stiffness: 90}});

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: portrait ? 52 : 82}}>
      <div
        style={{
          ...metallicPanel,
          borderRadius: portrait ? 76 : 140,
          padding: portrait ? '28px 24px' : '34px 54px',
          opacity: pop,
          transform: `scale(${interpolate(pop, [0, 1], [0.92, 1])})`,
        }}
      >
        <div
          style={{
            fontFamily: font.display,
            color: palette.white,
            fontSize: portrait ? 72 : 88,
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: 1.5,
            lineHeight: 0.95,
            textAlign: 'center',
          }}
        >
          rhythm in,
          <br />
          reliability out.
        </div>
        <div
          style={{
            marginTop: 10,
            textAlign: 'center',
            fontFamily: font.mono,
            color: palette.fog,
            fontSize: portrait ? 24 : 26,
          }}
        >
          ranker-agentic-workflow // v3
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Soundtrack: React.FC = () => {
  return <Audio src={staticFile('audio/industrial-pulse-120bpm.wav')} volume={0.85} />;
};

export const IndustrialWorkflowShowcaseV3: React.FC = () => {
  return (
    <AbsoluteFill>
      <Soundtrack />
      <V3Background />
      <BeatRing x={1450} y={90} />
      <BeatRing x={126} y={740} />
      <Sequence from={0} durationInFrames={170}>
        <TitleCard />
      </Sequence>
      <Sequence from={134} durationInFrames={220}>
        <CueTimeline />
      </Sequence>
      <Sequence from={324} durationInFrames={210}>
        <QualityHUD />
      </Sequence>
      <Sequence from={534} durationInFrames={186}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};

export const IndustrialWorkflowShowcaseV3Vertical: React.FC = () => {
  return (
    <AbsoluteFill>
      <Soundtrack />
      <V3Background />
      <BeatRing x={770} y={100} />
      <BeatRing x={40} y={1450} />
      <Sequence from={0} durationInFrames={170}>
        <TitleCard portrait />
      </Sequence>
      <Sequence from={140} durationInFrames={245}>
        <CueTimeline portrait />
      </Sequence>
      <Sequence from={360} durationInFrames={210}>
        <QualityHUD portrait />
      </Sequence>
      <Sequence from={560} durationInFrames={160}>
        <EndCard portrait />
      </Sequence>
    </AbsoluteFill>
  );
};
