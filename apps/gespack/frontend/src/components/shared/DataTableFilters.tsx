// src/components/shared/DataTableFilters.tsx
import React from "react";
import DatePicker from "react-datepicker";
import { fmtYMD } from "./DataTableUtils";

export const BooleanFilter: React.FC<{
  value: string | undefined;
  onChange: (v: string) => void;
  anyLabel: string;
  yesLabel: string;
  noLabel: string;
}> = ({ value = "", onChange, anyLabel, yesLabel, noLabel }) => (
  <select className="filter-input" value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="">{anyLabel}</option>
    <option value="true">{yesLabel}</option>
    <option value="false">{noLabel}</option>
  </select>
);

export const DateRangeFilter: React.FC<{
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder: string;
}> = ({ value = "", onChange, placeholder }) => {
  const [start, end] = React.useMemo(() => {
    if (!value) return [null, null] as [Date | null, Date | null];
    if (value.includes("..")) {
      const [a, b] = value.split("..");
      return [a ? new Date(a) : null, b ? new Date(b) : null];
    }
    return [new Date(value), null];
  }, [value]);

  return (
    <DatePicker
      className="filter-input date-range-picker"
      wrapperClassName="date-range-wrapper"
      selectsRange
      isClearable
      placeholderText={placeholder}
      dateFormat="yyyy-MM-dd"
      startDate={start}
      endDate={end}
      onChange={(update) => {
        const [s, e] = update as [Date | null, Date | null];
        if (s && e) onChange(`${fmtYMD(s)}..${fmtYMD(e)}`);
        else if (s && !e) onChange(fmtYMD(s));
        else onChange("");
      }}
      popperClassName="datepicker-popper"
      popperPlacement="bottom-start"
      closeOnScroll={false}
      portalId="root"
    />
  );
};