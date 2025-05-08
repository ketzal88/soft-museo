declare module 'react-big-calendar' {
  import { ComponentType, ElementType, ReactNode } from 'react';
  
  export interface Event {
    id?: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: any;
    [key: string]: any;
  }
  
  export interface Views {
    MONTH: string;
    WEEK: string;
    WORK_WEEK: string;
    DAY: string;
    AGENDA: string;
  }
  
  export interface Culture {
    formats: Record<string, string>;
    messages: Record<string, string>;
  }
  
  export interface CalendarProps {
    date?: Date;
    events: Event[];
    view?: string;
    onNavigate?: (newDate: Date) => void;
    onView?: (view: string) => void;
    onSelectEvent?: (event: Event) => void;
    onSelectSlot?: (slotInfo: { start: Date; end: Date; slots: Date[]; action: 'select' | 'click' | 'doubleClick' }) => void;
    onDrillDown?: (date: Date, view: string) => void;
    onRangeChange?: (range: { start: Date; end: Date }) => void;
    onShowMore?: (events: Event[], date: Date) => void;
    culture?: string;
    components?: {
      event?: ComponentType<any>;
      eventWrapper?: ComponentType<any>;
      dayWrapper?: ComponentType<any>;
      dateCellWrapper?: ComponentType<any>;
      toolbar?: ComponentType<any>;
      agenda?: {
        date?: ComponentType<any>;
        time?: ComponentType<any>;
        event?: ComponentType<any>;
      };
      day?: {
        header?: ComponentType<any>;
        event?: ComponentType<any>;
      };
      week?: {
        header?: ComponentType<any>;
        event?: ComponentType<any>;
      };
      month?: {
        header?: ComponentType<any>;
        dateHeader?: ComponentType<any>;
        event?: ComponentType<any>;
      };
    };
    messages?: Record<string, string>;
    formats?: Record<string, string | ((date: Date, culture: Culture, localizer: any) => string)>;
    startAccessor?: string | ((event: Event) => Date);
    endAccessor?: string | ((event: Event) => Date);
    titleAccessor?: string | ((event: Event) => string);
    allDayAccessor?: string | ((event: Event) => boolean);
    resourceAccessor?: string | ((event: Event) => any);
    resources?: any[];
    resourceIdAccessor?: string | ((resource: any) => string | number);
    resourceTitleAccessor?: string | ((resource: any) => string);
    defaultView?: string;
    defaultDate?: Date;
    views?: string[] | Record<string, boolean> | View[];
    step?: number;
    length?: number;
    drilldownView?: string;
    titleFormat?: string;
    dayFormat?: string;
    dayRangeHeaderFormat?: (range: { start: Date; end: Date }) => string;
    dayHeaderFormat?: string;
    dayPropGetter?: (date: Date) => Record<string, any>;
    slotPropGetter?: (date: Date) => Record<string, any>;
    timeSlotWrapperProps?: Record<string, any>;
    dayWrapperProps?: Record<string, any>;
    eventPropGetter?: (event: Event, start: Date, end: Date, isSelected: boolean) => Record<string, any>;
    selectable?: boolean | 'ignoreEvents';
    longPressThreshold?: number;
    resizable?: boolean;
    scrollToTime?: Date;
    popup?: boolean;
    popupOffset?: number | { x: number; y: number };
    onDoubleClickEvent?: (event: Event, e: React.SyntheticEvent) => void;
    onKeyPressEvent?: (event: Event, e: React.SyntheticEvent) => void;
    showMultiDayTimes?: boolean;
    min?: Date;
    max?: Date;
    timeslots?: number;
    rtl?: boolean;
    eventWrapperProps?: Record<string, any>;
    getNow?: () => Date;
    localizer: any;
    style?: React.CSSProperties;
    className?: string;
    elementProps?: React.HTMLAttributes<HTMLDivElement>;
  }
  
  export const Calendar: ComponentType<CalendarProps>;
  export const Views: Views;
  export const momentLocalizer: (moment: any) => any;
  export const globalizeLocalizer: (globalize: any) => any;
  export const dateFnsLocalizer: (settings: any) => any;
  export const move: (View: any, date: Date, direction: number, view: any) => Date;
  export const navigate: (date: Date, action: 'PREV' | 'NEXT' | 'TODAY' | 'DATE', view: any) => Date;
} 