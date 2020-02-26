import _minBy from "lodash/minBy";
import _maxBy from "lodash/maxBy";
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
import {
  HomeRequestTrendData,
  HomeRequestLatestData,
  IMeasurement,
  HomeSetTrendPeriod
} from "./";
import moment from "moment";
import * as d3 from "d3-scale";

export const HomePage = () => {
  const boxes = useSelector((state: AppState) => state.home.boxes);

  if (boxes.length === 0) {
    return (
      <div className="section">
        <div className="columns" style={{ marginTop: "40px" }}>
          <div
            className="column is-2 is-offset-5"
            style={{ justifyContent: "center", display: "flex" }}
          >
            <progress
              className="progress is-small is-primary"
              max="100"
            ></progress>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="columns is-multiline is-5">
        {boxes.map(box => {
          return (
            <div key={box.id} className="column is-one-third">
              <Card box={box} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Value = (props: any) => {
  const style: any = { textAlign: "center", marginTop: `${props.offset}px` };

  if (_isNil(props.value)) {
    return (
      <h5 style={style} className="">
        No data
      </h5>
    );
  }
  return (
    <h4
      className={`text-${props.color} is-${props.color}`}
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
    <h6 className="has-text-centered">
      <span className={!valid ? "has-text-grey-light" : ""}>
        <Icon name={props.name} size="is-large fa-2x" />
      </span>
    </h6>
  );
};

export const Card = (props: any) => {
  const dispatch = useDispatch(),
    box = props.box;

  useEffect(() => {
    // Initial data
    dispatch(new HomeRequestLatestData(box.id, 1));
    dispatch(new HomeRequestLatestData(box.id, 2));

    // Poll every n sec
    setInterval(() => dispatch(new HomeRequestLatestData(box.id, 1)), 10000);
    setInterval(() => dispatch(new HomeRequestLatestData(box.id, 2)), 10000);
  }, []);

  const tempMinutes = useSelector((state: AppState) => {
      return _get(state.home.data, `${box?.id}.2.period`, 60);
    }),
    humidMinutes = useSelector((state: AppState) => {
      return _get(state.home.data, `${box?.id}.1.period`, 60);
    });

  const temperature = useSelector((state: AppState) =>
      _get(state.home.data, `${box.id}.${1}.latest`, null)
    ),
    humidity = useSelector((state: AppState) =>
      _get(state.home.data, `${box.id}.${2}.latest`, null)
    ),
    tempProgress = valueAsPercentage(temperature?.value, {
      min: 0,
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
    <div className={`card ${status}`}>
      <div className="card-content">
        <div className="columns is-mobile is-multiline">
          <span className="column is-one-quarter">
            <Icon
              name="box-open"
              color={
                status === "online"
                  ? "success"
                  : status === "faulty"
                  ? "warning"
                  : "danger"
              }
              size="is-large fa-2x"
            />
          </span>
          <p className="title column is-three-quarters is-size-5">
            {box.owner.name} - {box.description}
            <span className="subtitle column is-full has-text-grey-light is-size-7">
              {sinceLastDate.isValid()
                ? `Updated ${sinceLastDate.fromNow()}`
                : "No data yet..."}
            </span>
          </p>
        </div>
      </div>
      <div className="card-content">
        <div className="columns is-mobile">
          <div className="column is-three-quarters">
            <MeasurementHeader name="temperature-low" value={temperature} />
            <Gauge size={1} degrees={180}>
              <GaugeBar progress={100} size={3} />
              <GaugeBar progress={tempProgress} color="danger" />
            </Gauge>
            <Value value={temperature?.value} unit="℃" />
          </div>
          <div className="column">
            <MeasurementHeader name="tint" value={humidity} />
            <Bar>
              <BarFill progress={100} />
              <BarFill progress={humidProgress} color="link" />
            </Bar>
            <Value
              value={humidity?.value}
              unit="%"
              color="grey-light"
              offset={0}
            />
          </div>
        </div>
        <div className="columns is-mobile">
          <div className="column">
            <Trend box={box} tempSensor={{ id: 1 }} humidSensor={{ id: 2 }} />
            <TrendTime box={box} current={tempMinutes || humidMinutes} />
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

export const Trend = (props: any) => {
  const { tempSensor, humidSensor, box } = props,
    dispatch = useDispatch();

  // Initial data
  useEffect(() => {
    dispatch(new HomeRequestTrendData(box.id, tempSensor.id));
    dispatch(new HomeRequestTrendData(box.id, humidSensor.id));
  }, []);

  // Poll every n sec
  useEffect(() => {
    setInterval(() => {
      dispatch(new HomeRequestTrendData(box.id, tempSensor.id));
    }, 10000);
    setInterval(() => {
      dispatch(new HomeRequestTrendData(box.id, humidSensor.id));
    }, 10000);
  }, []);

  const height = 50,
    width = 250;
  const padding = {
      x: -width * 0.05,
      y: -height * 0.25,
      width: width * 0.1,
      height: height * 0.5
    },
    viewBox = {
      x: 0 + padding.x,
      y: 0 + padding.y,
      width: width + padding.width,
      height: height + padding.height
    };

  const temperature = useSelector(
    (state: AppState) =>
      _get(
        state.home.data,
        `${box.id}.${tempSensor.id}.trend`,
        []
      ) as IMeasurement[]
  );

  const humidity = useSelector(
    (state: AppState) =>
      _get(
        state.home.data,
        `${box.id}.${humidSensor.id}.trend`,
        []
      ) as IMeasurement[]
  );

  const y = d3
    .scaleLinear()
    .domain([0, 40])
    .range([50, 0]);

  const yh = d3
    .scaleLinear()
    .domain([0, 100])
    .range([50, 0]);

  const s = _minBy(temperature, "timestamp") ?? {
    timestamp: moment()
      .subtract("1", "hour")
      .valueOf()
  };
  const last = _maxBy(temperature, "timestamp") ?? null;
  const x = d3
    .scaleLinear()
    .domain([s.timestamp, moment().valueOf()])
    .range([0, 250]);

  return (
    <svg
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      shapeRendering="geometricPrecision"
    >
      <clipPath id="valueClip">
        <rect x="0" y="0" width="250" height="50" />
      </clipPath>

      <g className="trend">
        <rect
          x="0"
          y="0"
          width="250"
          height="50"
          fill="none"
          className="stroke-light"
        />
        <g clipPath="url(#valueClip)">
          {humidity.map((h, i) => {
            const height = yh(100 - h.value);
            return (
              <rect
                key={`humidity-${i}`}
                transform={`translate(-0.5,${yh(h.value)})`}
                className="fill-link"
                fillOpacity={`${h.value}%`}
                x={x(h.timestamp)}
                y={0}
                width={1}
                height={height}
              />
            );
          })}
        </g>
        <path
          clipPath="url(#valueClip)"
          d={temperature.reduce((result, t, index) => {
            const h = index === 0 ? "M" : "L";
            return (result += `${h}${x(t.timestamp)},${y(t.value)} `);
          }, "")}
          className="stroke-danger"
          fill="none"
          strokeWidth="1"
        />
        <g className="x-ticks">
          {x.ticks(3).map(t => {
            return (
              <text
                key={`x-tick-${t}`}
                x={x(t)}
                y={58}
                className="fill-grey-light"
                style={{ fontSize: 8 }}
              >
                {moment(t).fromNow()}
              </text>
            );
          })}
          <line
            className="stroke-positive"
            x1="250"
            y1="0"
            x2="250"
            y2="50"
            strokeDasharray="2,2"
          />
          <text
            key={`x-tick-now`}
            x={243}
            y={-3}
            className="fill-positive"
            style={{ fontSize: 8 }}
          >
            now
          </text>
        </g>
        <g className="y-ticks">
          {y.ticks(4).map(v => {
            return (
              <text
                key={`y-tick-${v}`}
                x={-2}
                y={y(v)}
                className="fill-grey-light"
                textAnchor="end"
                style={{ fontSize: 8 }}
              >
                {v}
              </text>
            );
          })}
        </g>
        {last && (
          <g className="last-point">
            <circle
              className="fill-danger"
              cx={x(last.timestamp)}
              cy={y(last.value)}
              r="3"
            />
            <circle
              className="fill-light"
              cx={x(last.timestamp)}
              cy={y(last.value)}
              r="2"
            />
            <circle
              className="fill-danger"
              cx={x(last.timestamp)}
              cy={y(last.value)}
              r="1"
            />
          </g>
        )}
      </g>
    </svg>
  );
};

const TrendTime = (props: any) => {
  const { current, box } = props,
    dispatch = useDispatch(),
    setPeriod = (minutes: number) => {
      dispatch(new HomeSetTrendPeriod(minutes, box.id, 1));
      dispatch(new HomeSetTrendPeriod(minutes, box.id, 2));
    };

  return (
    <div className="columns is-mobile" style={{ marginTop: "10px" }}>
      <div className="column is-right is-one-quarter">Last:</div>
      <div className="column is-three-quarters">
        <div className="buttons has-addons is-right">
          <div
            className={`button is-small is-${
              current === 43830 ? "success" : ""
            }`}
            onClick={() => setPeriod(43830)}
          >
            Month
          </div>
          <div
            className={`button is-small is-${
              current === 10080 ? "success" : ""
            }`}
            onClick={() => setPeriod(10080)}
          >
            Week
          </div>
          <div
            className={`button is-small is-${
              current === 1440 ? "success" : ""
            }`}
            onClick={() => setPeriod(1440)}
          >
            Day
          </div>
          <div
            className={`button is-small is-${
              _isNil(current) || current === 60 ? "success" : ""
            }`}
            onClick={() => setPeriod(60)}
          >
            Hour
          </div>
        </div>
      </div>
    </div>
  );
};
