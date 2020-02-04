import _get from "lodash/get";
import _isNil from "lodash/isNil";
import _filter from "lodash/filter";
import _map from "lodash/map";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  AppState,
  progressOfTotal,
  percentToAngle,
  circleCircumference,
  valueAsPercentage,
  Icon
} from "../core";
import { HomeRequestTrendData, HomeRequestLatestData } from "./";
import moment from "moment";

export const HomePage = () => {
  const boxes = useSelector((state: AppState) => state.home.boxes);

  if (boxes.length === 0) {
    return (
      <div className="row" style={{ marginTop: "40px" }}>
        <div
          className="col-12"
          style={{ justifyContent: "center", display: "flex" }}
        >
          <i
            className="p-icon--spinner u-animation--spin"
            style={{ marginRight: "10px", width: "24px", height: "24px" }}
          ></i>
          <div>Please wait... </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      {boxes.map(box => {
        return <Card key={box.id} user={box.name} boxId={box.id} />;
      })}
    </div>
  );
};

const Value = (props: any) => {
  const style: any = { textAlign: "center", marginTop: `${props.offset}px` };

  if (_isNil(props.value)) {
    return (
      <h5 style={style} className="text-mid-light text-nowrap">
        No data
      </h5>
    );
  }
  return (
    <h4
      className={`text-${props.color}`}
      style={style}
    >{`${props.value}${props.unit}`}</h4>
  );
};
Value.defaultProps = {
  offset: -60,
  color: "dark"
};

const MeasurementHeader = (props: any) => {
  const valid = !_isNil(props.value?.timestamp);

  return (
    <h6 className="text-center">
      <span className={!valid ? "text-mid-light" : ""}>
        <Icon name={props.name} size={2} />
      </span>
    </h6>
  );
};

export const Card = (props: any) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initial data
    dispatch(new HomeRequestLatestData(props.boxId, 1));
    dispatch(new HomeRequestLatestData(props.boxId, 13));

    // Poll every 30sec
    setInterval(
      () => dispatch(new HomeRequestLatestData(props.boxId, 1)),
      10000
    );
    setInterval(
      () => dispatch(new HomeRequestLatestData(props.boxId, 13)),
      10000
    );
  }, []);

  const temperature = useSelector((state: AppState) =>
      _get(state.home.data, `${props.boxId}.${1}.latest`, null)
    ),
    humidity = useSelector((state: AppState) =>
      _get(state.home.data, `${props.boxId}.${13}.latest`, null)
    ),
    tempProgress = valueAsPercentage(temperature?.value, {
      min: -10,
      max: 40
    }),
    humidProgress = valueAsPercentage(humidity?.value, {
      min: 0,
      max: 100
    });

  // Check for timer updates every second (to have accurate fromNow time)
  const [, triggerRender] = useState(0);
  useEffect(() => {
    let updateInterval = setInterval(() => triggerRender(i => i + 1), 1000);
    return () => {
      clearInterval(updateInterval);
    };
  });

  const sinceLast = Math.max(temperature?.timestamp, humidity?.timestamp),
    sinceLastDate = moment(sinceLast),
    ssm = Math.min(moment().diff(sinceLastDate, "seconds")),
    status = ssm < 60 ? "online" : ssm < 240 ? "faulty" : "offline";

  return (
    <div className={`p-card box ${status} col-4`}>
      <h3 className="p-card__title">
        <i className="p-icon--information"></i>
        <span>{props.user}</span>
        <span style={{ fontSize: 15, float: "right" }}>
          {sinceLastDate.isValid()
            ? `Updated ${sinceLastDate.fromNow()}`
            : "No data yet..."}
        </span>
      </h3>
      <hr className="u-sv1" />
      <div className="p-card__content">
        <div className="row">
          <div className="col-3">
            <MeasurementHeader name="thermometer" value={temperature} />
            <Gauge size={1} degrees={180}>
              <GaugeBar progress={100} size={3} />
              <GaugeBar progress={tempProgress} color="negative" />
            </Gauge>
            <Value value={temperature?.value} unit="℃" />
          </div>
          <div className="col-1">
            <MeasurementHeader name="water" value={humidity} />
            <Bar>
              <BarFill progress={100} />
              <BarFill progress={humidProgress} color="link" />
            </Bar>
            <Value
              value={humidity?.value}
              unit="%"
              color="mid-dark"
              offset={0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface IBaseGaugeProps {
  radius: number;
  degrees: number;
  calculateAngle: (percentage: number) => number;
  calculateProgress: (progress: number, circumference: number) => number;
  size: number;
  color: string;
  flip: boolean;
  children?: any;
}
const baseGaugeProps: IBaseGaugeProps = {
  radius: 25,
  degrees: 180,
  calculateAngle: (percentage: number) => percentToAngle(percentage, 180),
  calculateProgress: (progress: number, circumference: number) =>
    progressOfTotal(progress, circumference, 180),
  color: "light",
  size: 4,
  flip: false
};

interface GaugeBarProps extends IBaseGaugeProps {
  progress: number;
}
export const GaugeBar = (props: GaugeBarProps) => {
  const circumference = circleCircumference(props.radius),
    progress = props.calculateProgress(props.progress, circumference);
  return (
    <circle
      className={`gauge-arc stroke-${props.color}`}
      cx="25"
      cy="25"
      r={props.radius}
      strokeDasharray={circumference}
      strokeDashoffset={progress}
      strokeWidth={props.size}
    />
  );
};
GaugeBar.defaultProps = {
  ...baseGaugeProps,
  progress: 0
};

export const Gauge = (props: IBaseGaugeProps) => {
  const radius = props.radius - props.size;
  const adjustment = props.degrees > 90 ? 0 : 25,
    padding = {
      x: -5 + adjustment,
      y: -7.5,
      width: 10 - adjustment,
      height: 10
    },
    viewBox = {
      x: 0 + padding.x,
      y: 25 + padding.y,
      width: 50 + padding.width,
      height: 25 + padding.height
    };

  return (
    <svg
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      style={{
        transform: `rotate(180deg) ${props.flip ? "scale(-1, 1)" : ""}`
      }}
      shapeRendering="geometricPrecision"
    >
      <g className="gauge">
        {...props.children.map((c: any) => ({
          ...c,
          props: {
            ...c.props,
            radius,
            size: props.size,
            degrees: props.degrees,
            flip: props.flip,
            calculateAngle: (percentage: number) =>
              percentToAngle(percentage, props.degrees),
            calculateProgress: (progress: number, circumference: number) =>
              progressOfTotal(progress, circumference, props.degrees)
          }
        }))}
      </g>
    </svg>
  );
};

Gauge.defaultProps = baseGaugeProps;

interface IBaseBarProps {
  color: string;
  width: number;
  height: number;
  children?: any;
}
const baseBarProps: IBaseBarProps = {
  color: "light",
  width: 0,
  height: 0
};

interface BarFillProps extends IBaseBarProps {
  progress: number;
}
export const BarFill = (props: BarFillProps) => {
  const progress = (props.progress * props.height) / 100;
  return (
    <rect
      transform={`rotate(180, 0, 0) translate(-${props.width}, -${props.height})`}
      x={0}
      y={0}
      width={props.width}
      height={progress}
      className={`bar-fill fill-${props.color}`}
    />
  );
};
BarFill.defaultProps = {
  ...baseBarProps,
  progress: 0
};

export const Bar = (props: IBaseBarProps) => {
  const height = 40,
    width = 20;
  const padding = {
      x: -width * 0.05,
      y: -height * 0.05,
      width: width * 0.1,
      height: height * 0.1
    },
    viewBox = {
      x: 0 + padding.x,
      y: 0 + padding.y,
      width: width + padding.width,
      height: height + padding.height
    };
  return (
    <svg
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      shapeRendering="geometricPrecision"
    >
      <g className="bar">
        {...props.children.map((c: any) => ({
          ...c,
          props: {
            ...c.props,
            height,
            width
          }
        }))}
      </g>
    </svg>
  );
};

Bar.defaultProps = baseBarProps;
