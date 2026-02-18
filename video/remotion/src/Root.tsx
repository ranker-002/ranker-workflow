import {Composition} from 'remotion';
import {IndustrialWorkflowShowcase} from './IndustrialWorkflowShowcase';
import {IndustrialWorkflowShowcaseV2} from './IndustrialWorkflowShowcaseV2';
import {
  IndustrialWorkflowShowcaseV3,
  IndustrialWorkflowShowcaseV3Vertical,
} from './IndustrialWorkflowShowcaseV3';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="RankerWorkflowShowcase"
        component={IndustrialWorkflowShowcase}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="RankerWorkflowShowcaseV2"
        component={IndustrialWorkflowShowcaseV2}
        durationInFrames={720}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="RankerWorkflowShowcaseV3"
        component={IndustrialWorkflowShowcaseV3}
        durationInFrames={720}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="RankerWorkflowShowcaseV3Vertical"
        component={IndustrialWorkflowShowcaseV3Vertical}
        durationInFrames={720}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};
