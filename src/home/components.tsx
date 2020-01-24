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
  valueAsPercentage
} from "../core";
import { HomeRequestData } from "./";
import * as d3 from "d3-scale";
import moment from "moment";

export const HomePage = () => {
  return (
    <div className="row">
      <div className="col-12">
        <div className="row">
          <div className="col-6">
            <Card user="Stian" boxId="1000" />
          </div>
          <div className="col-6">
            <Card user="Mads" boxId="2000" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Value = (props: any) => {
  return <h3 className="text-dark">{`${props.value}${props.unit}`} </h3>;
};

export const Card = (props: any) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initial data
    dispatch(new HomeRequestData(props.boxId, 1));
    dispatch(new HomeRequestData(props.boxId, 13));

    // Poll every 30sec
    setInterval(() => dispatch(new HomeRequestData(props.boxId, 1)), 10000);
    setInterval(() => dispatch(new HomeRequestData(props.boxId, 13)), 10000);
  }, []);

  const [temperature] = useSelector((state: AppState) =>
      _get(state.home.data, `${props.boxId}.${1}`, [])
    ),
    [humidity] = useSelector((state: AppState) =>
      _get(state.home.data, `${props.boxId}.${13}`, [])
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

  return (
    <div className="p-card">
      <h3 className="p-card__title">
        <i className="p-icon--information"></i> {props.user}
      </h3>
      <hr className="u-sv1" />
      <div className="p-card__content">
        <div className="row">
          <div className="col-3">
            <h6>Temperature {moment(temperature?.timestamp).fromNow()}</h6>
            <Gauge size={1} degrees={180}>
              <GaugeBar progress={100} size={3} />
              <GaugeBar progress={tempProgress} color="brand" />
            </Gauge>
            <Value value={temperature?.value} unit="℃" />
          </div>
          <div className="col-3">
            <h6>Humidity {moment(humidity?.timestamp).fromNow()}</h6>
            <Gauge size={1} degrees={180}>
              <GaugeBar progress={100} size={3} />
              <GaugeBar progress={humidProgress} color="brand" />
            </Gauge>
            <Value value={humidity?.value} unit="%" />
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
  // Adjusted svg coordinate-space from 0 25 50 25 because of padding to render ticks
  // Move the entire gauge half a width if under 90 degrees, to get it to the edge
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
