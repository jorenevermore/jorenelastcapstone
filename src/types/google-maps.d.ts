
declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      setOptions(options: MapOptions): void;
      panTo(latLng: LatLng | LatLngLiteral): void;
      panBy(x: number, y: number): void;
      fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
      getBounds(): LatLngBounds;
      getCenter(): LatLng;
      getDiv(): Element;
      getZoom(): number;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    class LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
      lat(): number;
      lng(): number;
      toString(): string;
      toUrlValue(precision?: number): string;
      equals(other: LatLng): boolean;
    }

    class LatLngBounds {
      constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
      contains(latLng: LatLng | LatLngLiteral): boolean;
      equals(other: LatLngBounds | LatLngBoundsLiteral): boolean;
      extend(point: LatLng | LatLngLiteral): LatLngBounds;
      getCenter(): LatLng;
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
      isEmpty(): boolean;
      toSpan(): LatLng;
      toString(): string;
      toUrlValue(precision?: number): string;
      union(other: LatLngBounds | LatLngBoundsLiteral): LatLngBounds;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      setPosition(latLng: LatLng | LatLngLiteral): void;
      setTitle(title: string): void;
      setLabel(label: string | MarkerLabel): void;
      setDraggable(draggable: boolean): void;
      setIcon(icon: string | Icon | Symbol): void;
      setOpacity(opacity: number): void;
      setVisible(visible: boolean): void;
      setZIndex(zIndex: number): void;
      getPosition(): LatLng;
      getTitle(): string;
      getLabel(): MarkerLabel;
      getDraggable(): boolean;
      getIcon(): string | Icon | Symbol;
      getMap(): Map | null;
      getOpacity(): number;
      getVisible(): boolean;
      getZIndex(): number;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: string;
      disableDefaultUI?: boolean;
      disableDoubleClickZoom?: boolean;
      draggable?: boolean;
      fullscreenControl?: boolean;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      zoomControl?: boolean;
      gestureHandling?: string;
      clickableIcons?: boolean;
      styles?: MapTypeStyle[];
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface LatLngBoundsLiteral {
      east: number;
      north: number;
      south: number;
      west: number;
    }

    interface MarkerOptions {
      position: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      label?: string | MarkerLabel;
      draggable?: boolean;
      icon?: string | Icon | Symbol;
      opacity?: number;
      visible?: boolean;
      zIndex?: number;
      animation?: Animation;
      clickable?: boolean;
    }

    interface MarkerLabel {
      text: string;
      color?: string;
      fontFamily?: string;
      fontSize?: string;
      fontWeight?: string;
    }

    interface Icon {
      url?: string;
      path?: string;
      size?: Size;
      scaledSize?: Size;
      origin?: Point;
      anchor?: Point;
      labelOrigin?: Point;
      fillColor?: string;
      fillOpacity?: number;
      strokeWeight?: number;
      strokeColor?: string;
      scale?: number;
      rotation?: number;
    }

    class Size {
      constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
      equals(other: Size): boolean;
      width: number;
      height: number;
    }

    class Point {
      constructor(x: number, y: number);
      equals(other: Point): boolean;
      x: number;
      y: number;
    }

    class Symbol {
      constructor(path: string | SymbolPath, opts?: SymbolOptions);
    }

    enum SymbolPath {
      BACKWARD_CLOSED_ARROW,
      BACKWARD_OPEN_ARROW,
      CIRCLE,
      FORWARD_CLOSED_ARROW,
      FORWARD_OPEN_ARROW
    }

    interface SymbolOptions {
      fillColor?: string;
      fillOpacity?: number;
      scale?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    }

    enum Animation {
      BOUNCE,
      DROP
    }

    interface MapTypeStyle {
      elementType?: string;
      featureType?: string;
      stylers: MapTypeStyler[];
    }

    interface MapTypeStyler {
      [key: string]: string | number | boolean;
    }

    interface MapsEventListener {
      remove(): void;
    }

    interface MapMouseEvent {
      latLng: LatLng;
    }

    class Circle {
      constructor(opts?: CircleOptions);
      setMap(map: Map | null): void;
      setCenter(center: LatLng | LatLngLiteral): void;
      setRadius(radius: number): void;
      getBounds(): LatLngBounds;
      getCenter(): LatLng;
      getRadius(): number;
      setOptions(options: CircleOptions): void;
    }

    interface CircleOptions {
      center?: LatLng | LatLngLiteral;
      radius?: number;
      map?: Map;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      fillColor?: string;
      fillOpacity?: number;
      zIndex?: number;
      clickable?: boolean;
      draggable?: boolean;
      editable?: boolean;
      visible?: boolean;
    }

    namespace places {
      class SearchBox {
        constructor(inputField: HTMLInputElement, opts?: SearchBoxOptions);
        setBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
        getPlaces(): PlaceResult[];
        addListener(eventName: string, handler: Function): MapsEventListener;
      }

      interface SearchBoxOptions {
        bounds?: LatLngBounds | LatLngBoundsLiteral;
      }

      interface PlaceResult {
        geometry: {
          location: LatLng;
          viewport?: LatLngBounds;
        };
        name?: string;
        formatted_address?: string;
        place_id?: string;
        types?: string[];
        address_components?: AddressComponent[];
      }

      interface AddressComponent {
        long_name: string;
        short_name: string;
        types: string[];
      }
    }
  }
}

export {};
