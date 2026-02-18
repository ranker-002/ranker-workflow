import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame} from 'remotion';

const c = {
  black: '#040506',
  dark: '#0c0e11',
  steel: '#1d2229',
  silver: '#c6ccd3',
  white: '#f3f6fb',
  fog: '#88909a',
  line: 'rgba(236, 241, 248, 0.18)',
};

const font = {
  display: 'Rajdhani, Barlow Condensed, Helvetica Neue, sans-serif',
  body: 'IBM Plex Sans, Manrope, Helvetica Neue, sans-serif',
  mono: 'IBM Plex Mono, Space Mono, monospace',
};

const chromePanel: React.CSSProperties = {
  border: `1px solid ${c.line}`,
  background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.01))',
  boxShadow: '0 22px 70px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.03)',
  backdropFilter: 'blur(10px)',
};

const CinematicBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame, [0, 720], [-1200, 1600]);
  const drift = interpolate(frame, [0, 720], [0, -140]);

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background: `radial-gradient(circle at 20% 14%, ${c.steel} 0%, ${c.dark} 36%, ${c.black} 78%)`,
      }}
    >
      <AbsoluteFill
        style={{
          transform: `translateY(${drift}px)`,
          backgroundImage:
            'linear-gradient(rgba(243,246,251,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(243,246,251,0.06) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          opacity: 0.35,
          maskImage: 'radial-gradient(circle at 50% 35%, black 35%, transparent 88%)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(100deg, transparent 0%, rgba(245,249,255,0.08) 40%, transparent 56%)',
          transform: `translateX(${sweep}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'repeating-linear-gradient(180deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 2px, transparent 4px)',
          opacity: 0.28,
          mixBlendMode: 'screen',
        }}
      />
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{label: string}> = ({label}) => {
  return (
    <div
      style={{
        fontFamily: font.mono,
        fontSize: 24,
        letterSpacing: 3,
        textTransform: 'uppercase',
        color: c.fog,
      }}
    >
      {label}
    </div>
  );
};

const Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const intro = spring({frame, fps: 30, config: {damping: 15, stiffness: 85}});

  return (
    <AbsoluteFill style={{padding: 86, justifyContent: 'center'}}>
      <div
        style={{
          ...chromePanel,
          borderRadius: 34,
          padding: '52px 62px',
          opacity: intro,
          transform: `translateY(${interpolate(intro, [0, 1], [56, 0])}px) scale(${interpolate(intro, [0, 1], [0.96, 1])})`,
        }}
      >
        <Kicker label="Ranker Agentic Workflow // V2" />
        <div
          style={{
            marginTop: 14,
            fontFamily: font.display,
            fontSize: 112,
            lineHeight: 0.92,
            letterSpacing: 1,
            textTransform: 'uppercase',
            fontWeight: 700,
            color: c.white,
          }}
        >
          Cinematic
          <br />
          Delivery Engine
        </div>
        <div
          style={{
            marginTop: 24,
            maxWidth: 1240,
            fontFamily: font.body,
            fontSize: 34,
            color: c.silver,
            lineHeight: 1.35,
          }}
        >
          A resilient workflow where weaker models still ship correct complex features
          through strict tasks, guided skills, and automated verification.
        </div>
      </div>
    </AbsoluteFill>
  );
};

const MissionControl: React.FC = () => {
  const frame = useCurrentFrame();
  const panels = [
    {
      title: 'Input',
      lines: ['User feature request', 'Constraints + acceptance', 'Risk hints'],
    },
    {
      title: 'Orchestration',
      lines: ['brainstorming.skill', 'oneshot-feature.skill', 'debug.skill'],
    },
    {
      title: 'Gates',
      lines: ['security-audit', 'pr checklist', 'commit standard'],
    },
    {
      title: 'Output',
      lines: ['code + tests', 'docs updates', 'verified release-ready'],
    },
  ];

  return (
    <AbsoluteFill style={{padding: 84}}>
      <div
        style={{
          fontFamily: font.display,
          color: c.white,
          fontSize: 78,
          textTransform: 'uppercase',
          letterSpacing: 1,
          fontWeight: 700,
        }}
      >
        Mission Control Grid
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginTop: 26}}>
        {panels.map((p, i) => {
          const enter = spring({
            frame: frame - i * 6,
            fps: 30,
            config: {damping: 17, stiffness: 92},
          });
          return (
            <div
              key={p.title}
              style={{
                ...chromePanel,
                borderRadius: 22,
                minHeight: 208,
                padding: 24,
                opacity: enter,
                transform: `translateY(${interpolate(enter, [0, 1], [28, 0])}px)`,
              }}
            >
              <div
                style={{
                  color: c.white,
                  fontFamily: font.mono,
                  letterSpacing: 2,
                  fontSize: 28,
                  textTransform: 'uppercase',
                }}
              >
                {p.title}
              </div>
              <div style={{display: 'grid', gap: 10, marginTop: 14}}>
                {p.lines.map((line) => (
                  <div
                    key={line}
                    style={{
                      color: c.silver,
                      fontFamily: font.body,
                      fontSize: 30,
                      borderLeft: `3px solid ${c.line}`,
                      paddingLeft: 10,
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

const TimelineFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const milestones = [
    'Scope and define outcomes',
    'Implement with oneshot-feature',
    'Auto-debug and fix loops',
    'Security + regression checks',
    'PR/commit package and release',
  ];
  const progress = interpolate(frame, [0, 170], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{padding: 84}}>
      <div style={{...chromePanel, borderRadius: 28, padding: 36}}>
        <Kicker label="Execution Timeline" />
        <div
          style={{
            marginTop: 8,
            color: c.white,
            fontFamily: font.display,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontSize: 74,
          }}
        >
          one command, full pipeline
        </div>

        <div style={{marginTop: 22, fontFamily: font.mono, color: c.silver, fontSize: 34}}>
          $ npx ranker-agentic-workflow init my-project --agents codex,claude,opencode
        </div>

        <div style={{marginTop: 30, position: 'relative', height: 320}}>
          <div
            style={{
              position: 'absolute',
              top: 25,
              left: 10,
              right: 10,
              height: 2,
              background: 'rgba(255,255,255,0.16)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 25,
              left: 10,
              width: `${progress * 98}%`,
              height: 2,
              background: c.white,
            }}
          />

          {milestones.map((text, i) => {
            const t = i / (milestones.length - 1);
            const reveal = progress > t ? 1 : 0.4;
            return (
              <div
                key={text}
                style={{
                  position: 'absolute',
                  left: `calc(${t * 100}% - 10px)`,
                  top: 18,
                  width: 360,
                  opacity: reveal,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 99,
                    background: reveal > 0.5 ? c.white : c.fog,
                    boxShadow: reveal > 0.5 ? '0 0 0 5px rgba(255,255,255,0.15)' : 'none',
                  }}
                />
                <div
                  style={{
                    marginTop: 20,
                    color: c.silver,
                    fontFamily: font.body,
                    fontSize: 30,
                    maxWidth: 340,
                  }}
                >
                  {text}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ValidationBoard: React.FC = () => {
  const frame = useCurrentFrame();
  const checks = [
    'Task compliance matrix',
    'Architecture constraints kept',
    'Tests and lint stable',
    'Security and PR gates valid',
    'Production confidence score',
  ];

  return (
    <AbsoluteFill style={{padding: 84, justifyContent: 'center'}}>
      <div style={{...chromePanel, borderRadius: 24, padding: 34}}>
        <Kicker label="Verification Engine" />
        <div
          style={{
            marginTop: 8,
            color: c.white,
            fontFamily: font.display,
            fontSize: 72,
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          deterministic confidence
        </div>
        <div style={{marginTop: 18, display: 'grid', gap: 10}}>
          {checks.map((check, i) => {
            const pulse = interpolate(frame, [i * 12, i * 12 + 18], [0.45, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <div
                key={check}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: `1px solid ${c.line}`,
                  paddingBottom: 10,
                  opacity: pulse,
                }}
              >
                <span style={{fontFamily: font.body, color: c.silver, fontSize: 32}}>{check}</span>
                <span
                  style={{
                    fontFamily: font.mono,
                    color: c.white,
                    fontSize: 30,
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

const FinalLockup: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = spring({frame, fps: 30, config: {damping: 15, stiffness: 86}});

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          ...chromePanel,
          borderRadius: 160,
          padding: '36px 58px',
          opacity: pop,
          transform: `scale(${interpolate(pop, [0, 1], [0.92, 1])})`,
        }}
      >
        <div
          style={{
            color: c.white,
            fontFamily: font.display,
            textTransform: 'uppercase',
            letterSpacing: 2,
            fontWeight: 700,
            fontSize: 84,
            textAlign: 'center',
          }}
        >
          Complex features,
          <br />
          controlled outcomes.
        </div>
        <div
          style={{
            marginTop: 12,
            color: c.fog,
            textAlign: 'center',
            fontFamily: font.mono,
            fontSize: 28,
          }}
        >
          ranker-agentic-workflow // cinematic v2
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const IndustrialWorkflowShowcaseV2: React.FC = () => {
  return (
    <AbsoluteFill>
      <CinematicBackground />
      <Sequence from={0} durationInFrames={150}>
        <Hero />
      </Sequence>
      <Sequence from={118} durationInFrames={170}>
        <MissionControl />
      </Sequence>
      <Sequence from={270} durationInFrames={190}>
        <TimelineFlow />
      </Sequence>
      <Sequence from={438} durationInFrames={170}>
        <ValidationBoard />
      </Sequence>
      <Sequence from={608} durationInFrames={112}>
        <FinalLockup />
      </Sequence>
    </AbsoluteFill>
  );
};
