export interface SlideVideoParameters {
    identifier: string;
    source: string;
    attributes: string[];
}
export interface SlideOverlayParameters {
    heading: string;
    description: string;
    withProgress: boolean;
    status: string;
}
export interface WebcamParameters {
    identifier: string;
    attributes: string[];
}
export interface LoggerParameters {
    identifier: string;
    attributes: string[];
}
export interface SlideParameters {
    identifier: string,
    videoParameters: SlideVideoParameters,
    overlayParameters: SlideOverlayParameters,
    status: string
}
export interface BSObject {
    display_unit_address?: string,
    display_unit_id?: string,
    display_unit_lat_long?: string,
    display_unit_location_code?: string,
    display_unit_resolution?: string,
    player_id?: string,
    frame_id?: string,
    frame_resolution?: string,
    campaign_id?: string,
    impressions_per_hour?: string,
    expected_slot_duration_ms?: string,
    dwell_time_duration_ms?: string,
    expected_impressions?: string,
    mode?: string,
    action?: string
}
