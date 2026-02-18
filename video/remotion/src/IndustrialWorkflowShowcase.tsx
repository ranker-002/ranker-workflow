import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const palette = {
  bg0: '#060708',
  bg1: '#0f1114',
  bg2: '#1a1d21',
  silver: '#c7ccd3',
  smoke: '#8a9099',
  white: '#f5f7fb',
  accent: '#dfe4ea',
  line: 'rgba(235, 239, 246, 0.16)',
};

const typography = {
  headline: 'Rajdhani, Barlow Condensed, Helvetica Neue, sans-serif',
  body: 'IBM Plex Sans, Manrope, Helvetica Neue, sans-serif',
  mono: 'IBM Plex Mono, Space Mono, monospace',
};

const surface: React.CSSProperties = {
  border: `1px solid ${palette.line}`,
  background: 'linear-gradient(140deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))',
  boxShadow: '0 20px 55px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(255,255,255,0.03)',
  backdropFilter: 'blur(8px)',
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 600], [0, -120], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 15% 20%, ${palette.bg2} 0%, ${palette.bg1} 32%, ${palette.bg0} 78%)`,
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          transform: `translateY(${drift}px)`,
          backgroundImage:
            'linear-gradient(rgba(245,247,251,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(245,247,251,0.08) 1px, transparent 1px)',
          backgroundSize: '90px 90px',
          opacity: 0.32,
          maskImage: 'radial-gradient(circle at 50% 35%, black 35%, transparent 90%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(100deg, transparent 0%, rgba(245,247,251,0.05) 42%, transparent 60%)',
          transform: `translateX(${interpolate(frame, [0, 600], [-800, 1000])}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = spring({frame, fps: 30, config: {damping: 16, stiffness: 90}});

  return (
    <AbsoluteFill style={{padding: 90, justifyContent: 'center'}}>
      <div
        style={{
          ...surface,
          borderRadius: 32,
          padding: '52px 60px',
          transform: `translateY(${interpolate(appear, [0, 1], [60, 0])}px) scale(${interpolate(
            appear,
            [0, 1],
            [0.94, 1]
          )})`,
          opacity: appear,
        }}
      >
        <div
          style={{
            fontFamily: typography.mono,
            letterSpacing: 3,
            color: palette.smoke,
            fontSize: 26,
            textTransform: 'uppercase',
          }}
        >
          Ranker Agentic Workflow
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: typography.headline,
            fontSize: 100,
            lineHeight: 0.95,
            color: palette.white,
            letterSpacing: 1,
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          Industrial Minimal
          <br />
          Feature Execution
        </div>
        <div
          style={{
            marginTop: 28,
            maxWidth: 1150,
            fontFamily: typography.body,
            fontSize: 33,
            lineHeight: 1.35,
            color: palette.silver,
          }}
        >
          From prompt to verified delivery with deterministic tasks, predefined skills,
          and multi-agent compatibility.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Architecture: React.FC = () => {
  const frame = useCurrentFrame();
  const cols = [
    {
      title: 'Core',
      items: ['AGENTS.md', '.ranker/config.json', '.ranker/tasks/', '.ranker/skills/'],
    },
    {
      title: 'Execution',
      items: ['feature.task.md', 'oneshot-feature.skill.md', 'debug.skill.md', 'security-audit.skill.md'],
    },
    {
      title: 'Quality',
      items: ['verification gates', 'PR checklist', 'commit policy', 'traceable logs'],
    },
  ];

  return (
    <AbsoluteFill style={{padding: 88}}>
      <div
        style={{
          fontFamily: typography.headline,
          fontSize: 74,
          textTransform: 'uppercase',
          fontWeight: 700,
          color: palette.white,
          letterSpacing: 1.5,
        }}
      >
        Clear Architecture
      </div>
      <div
        style={{
          marginTop: 40,
          display: 'flex',
          gap: 24,
        }}
      >
        {cols.map((col, i) => {
          const enter = spring({
            frame: frame - i * 8,
            fps: 30,
            config: {damping: 14, stiffness: 92},
          });

          return (
            <div
              key={col.title}
              style={{
                ...surface,
                flex: 1,
                borderRadius: 22,
                padding: 28,
                opacity: enter,
                transform: `translateY(${interpolate(enter, [0, 1], [40, 0])}px)`,
              }}
            >
              <div
                style={{
                  color: palette.accent,
                  fontFamily: typography.mono,
                  fontSize: 28,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                }}
              >
                {col.title}
              </div>
              <div style={{marginTop: 18, display: 'grid', gap: 12}}>
                {col.items.map((line) => (
                  <div
                    key={line}
                    style={{
                      color: palette.silver,
                      fontFamily: typography.body,
                      fontSize: 30,
                      borderLeft: `3px solid ${palette.line}`,
                      paddingLeft: 12,
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const FeatureFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const steps = [
    '1. Brainstorming -> scope + risks',
    '2. oneshot-feature -> implementation',
    '3. debug + security-audit',
    '4. PR + commit automation',
    '5. verification gate -> ready',
  ];

  const commandReveal = interpolate(frame, [16, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{padding: 88}}>
      <div
        style={{
          ...surface,
          borderRadius: 30,
          padding: 38,
        }}
      >
        <div
          style={{
            fontFamily: typography.headline,
            fontSize: 66,
            color: palette.white,
            fontWeight: 700,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
          }}
        >
          One Command Flow
        </div>
        <div
          style={{
            marginTop: 24,
            fontFamily: typography.mono,
            fontSize: 35,
            color: palette.accent,
            opacity: commandReveal,
            transform: `translateY(${interpolate(commandReveal, [0, 1], [16, 0])}px)`,
          }}
        >
          $ npx ranker-agentic-workflow init my-project --agents codex,claude,opencode
        </div>

        <div style={{marginTop: 34, display: 'grid', gap: 12}}>
          {steps.map((step, index) => {
            const reveal = spring({
              frame: frame - index * 7,
              fps: 30,
              config: {damping: 18, stiffness: 94},
            });

            return (
              <div
                key={step}
                style={{
                  color: palette.silver,
                  fontFamily: typography.body,
                  fontSize: 34,
                  opacity: reveal,
                  transform: `translateX(${interpolate(reveal, [0, 1], [26, 0])}px)`,
                }}
              >
                {step}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Verification: React.FC = () => {
  const frame = useCurrentFrame();
  const gates = [
    {name: 'Task Contract', value: 'PASS'},
    {name: 'Implementation Checks', value: 'PASS'},
    {name: 'Security Checks', value: 'PASS'},
    {name: 'Regression Guard', value: 'PASS'},
  ];

  return (
    <AbsoluteFill style={{padding: 88, justifyContent: 'center'}}>
      <div
        style={{
          ...surface,
          borderRadius: 28,
          padding: 42,
        }}
      >
        <div
          style={{
            fontFamily: typography.headline,
            fontSize: 68,
            color: palette.white,
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: 1.2,
          }}
        >
          Deterministic Verification
        </div>
        <div style={{marginTop: 26, display: 'grid', gap: 14}}>
          {gates.map((gate, i) => {
            const pulse = interpolate(frame, [i * 15, i * 15 + 20], [0.6, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <div
                key={gate.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${palette.line}`,
                  paddingBottom: 10,
                  opacity: pulse,
                }}
              >
                <span style={{fontFamily: typography.body, color: palette.silver, fontSize: 34}}>
                  {gate.name}
                </span>
                <span
                  style={{
                    fontFamily: typography.mono,
                    color: palette.white,
                    fontSize: 32,
                    letterSpacing: 2,
                  }}
                >
                  {gate.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const appear = spring({frame, fps: 30, config: {damping: 16, stiffness: 85}});

  return (
    <AbsoluteFill style={{padding: 86, justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          ...surface,
          borderRadius: 200,
          padding: '38px 58px',
          opacity: appear,
          transform: `scale(${interpolate(appear, [0, 1], [0.9, 1])})`,
        }}
      >
        <div
          style={{
            color: palette.white,
            fontFamily: typography.headline,
            fontSize: 82,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 2,
            textAlign: 'center',
          }}
        >
          Build Complex Features. Reliably.
        </div>
        <div
          style={{
            marginTop: 12,
            color: palette.silver,
            fontFamily: typography.mono,
            fontSize: 30,
            textAlign: 'center',
          }}
        >
          ranker-agentic-workflow
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const IndustrialWorkflowShowcase: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <Sequence from={0} durationInFrames={150}>
        <Intro />
      </Sequence>
      <Sequence from={120} durationInFrames={170}>
        <Architecture />
      </Sequence>
      <Sequence from={270} durationInFrames={180}>
        <FeatureFlow />
      </Sequence>
      <Sequence from={430} durationInFrames={120}>
        <Verification />
      </Sequence>
      <Sequence from={530} durationInFrames={70}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
