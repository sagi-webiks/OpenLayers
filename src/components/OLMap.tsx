import React, { useRef, useEffect, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";
import { Icon, Style } from "ol/style";
import Pointer from "ol/interaction/Pointer";
import { Geometry, Polygon } from "ol/geom";
import { MarkerData } from "./AddMarker";
// import { MousePosition } from "ol/control";
import { Coordinate, createStringXY } from "ol/coordinate";
import { ScaleLine, MousePosition, defaults as defaultControls } from 'ol/control.js';
import { MapBrowserEvent } from "ol";





interface OpenLayerMapProps {
    center: [number, number]; // center of the map as latitude and longitude
    zoom: number; // zoom level of the map
    markers: MarkerData[];
    setCoords: (value: Coordinate) => void
}


const iconStyle = (icon: string) => {
    return new Style({
        image: new Icon({
            src: icon,

        }),
    });
}

const hoverStyle = (icon: string) => {
    return new Style({
        image: new Icon({
            src: icon,
            scale: 1.1
        }),
    });
}



const OpenLayerMap: React.FC<OpenLayerMapProps> = ({ center, zoom, markers, setCoords }) => {
    const [mapInst, setMapInst] = useState<Map | null>(null)
    const mapRef = useRef<HTMLDivElement>(null);
    const [markF, setMarkF] = useState<Feature[]>([])


    const [hoveredId, setHoveredId] = useState<string | undefined>('')
    const [lastHoveredIdx, setLastHoveredIdx] = useState<number>(-1)









    useEffect(() => {
        const mousePositionControl = new MousePosition({
            coordinateFormat: createStringXY(4),
            projection: 'EPSG:3857',
            // comment the following two lines to have the mouse position
            // be placed within the map.
            className: 'custom-mouse-position',


        });
        const scaleLineControl = new ScaleLine({
            units: 'metric',
            className: 'scale-line'
        });
        if (mapRef.current && !mapInst) {
            const map = new Map({
                target: mapRef.current,
                layers: [
                    new TileLayer({
                        source: new OSM(),
                    }),
                ],
                view: new View({
                    center: center,
                    zoom: zoom,
                }),
                controls: defaultControls().extend([mousePositionControl, scaleLineControl]),

            });
            const onClick = (evt: MapBrowserEvent<any>) => {
                // view.animate({
                //     center: evt.coordinate, duration: 200, zoom: 5
                // })
                console.log(evt.coordinate);
                setCoords(evt.coordinate)

                // setMenuVisible(true);
                // setMenuPosition(evt.pixel);

            };
            map.on('click', (evt) => onClick(evt))


            setMapInst(map)




            // create a pointer interaction and add it to the map
            const pointer = new Pointer({
                handleMoveEvent: (event) => {
                    const pixel = map.getEventPixel(event.originalEvent);
                    const hit = map.forEachFeatureAtPixel(pixel, (feature) => {
                        return feature;
                    });
                    if (hit) {
                        setHoveredId(hit.getId()?.toString());
                        map.getTargetElement().style.cursor = "pointer";
                    } else {
                        setHoveredId('');
                        map.getTargetElement().style.cursor = "";
                    }
                },
            });

            map.addInteraction(pointer);
        }
    }, [center, mapInst, zoom]);

    useEffect(() => {
        const pl: Feature<Polygon>[] = []
        const ms = markers.map(m => {
            const marker = new Feature({
                geometry: new Point(m.positions),
            });



            const tri = rotateTriangleAroundApex(m.positions, m.poly.width, m.poly.height, m.poly.angle)




            const poly = new Feature({
                geometry: new Polygon([tri])
            });
            pl.push(poly)

            marker.setId(m.id)

            marker.setStyle(iconStyle(m.image));
            return marker
        })
        const markerSource = new VectorSource({
            features: ms
        });

        const markerLayer = new VectorLayer({
            source: markerSource,
        });
        const polySource = new VectorSource({
            features: pl
        });

        const polyLayer = new VectorLayer({
            source: polySource,
        });
        setMarkF(ms)

        mapInst?.addLayer(markerLayer);
        mapInst?.addLayer(polyLayer);

    }, [mapInst, markers])

    useEffect(() => {
        if (hoveredId) {
            let idx = -1
            const filteredMarker: Feature<Geometry>[] = markF?.filter((m, i) => {
                if (m?.getId()?.toString() === hoveredId.toString()) {
                    setLastHoveredIdx(i)
                    idx = i
                    return m
                }
            })
            if (idx > -1) {

                filteredMarker[0].setStyle(hoverStyle(markers[idx].image))
            }




        } else {

            if (lastHoveredIdx > -1) {
                markF[lastHoveredIdx].setStyle(iconStyle(markers[lastHoveredIdx].image))

            }

        }

    }, [hoveredId, lastHoveredIdx, markF, markers]);

    return <>
        <div ref={mapRef} className="map-container" style={{ width: '500px', height: '500px' }}></div>
    </>
};


export default OpenLayerMap;


function rotateTriangleAroundApex(apex: Coordinate, baseWidth: number, height: number, angle: number): number[][] {
    const baseHalfWidth = baseWidth / 2;
    const baseLeft = apex[0] - baseHalfWidth;
    const baseRight = apex[0] + baseHalfWidth;
    const baseBottom = apex[1] + height;

    // Get coordinates of the base vertices
    const baseVertices = [[baseLeft, baseBottom], [baseRight, baseBottom]];

    // Calculate the angle in radians
    const radians = angle * Math.PI / 180;

    // Rotate each vertex around the apex
    const rotatedVertices = baseVertices.map((vertex) => {
        const relativeX = vertex[0] - apex[0];
        const relativeY = vertex[1] - apex[1];
        const rotatedX = relativeX * Math.cos(radians) - relativeY * Math.sin(radians);
        const rotatedY = relativeX * Math.sin(radians) + relativeY * Math.cos(radians);
        return [rotatedX + apex[0], rotatedY + apex[1]];
    });
    console.log(rotatedVertices[0]);

    // Return the rotated triangle as an array of vertices
    return [apex, rotatedVertices[0], rotatedVertices[1]];
}
