import p5 from "p5";
import React, { useEffect, useRef, useState } from "react";

// Define the type of the sine wave data
type SineWaveData = {
    x: number[];
    y: number[];
};

const App = () => {
    const [sineWaveData, setSineWaveData] = useState<SineWaveData | null>(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const { ipcRenderer } = window.electron;

        if (ipcRenderer) {
            ipcRenderer.on("sinewave-data", (event, message) => {
                setSineWaveData(message);
            });
        } else {
            console.error("ipcRenderer is not available");
        }
        return () => {
            // Cleanup listeners
            if (ipcRenderer) {
                ipcRenderer.removeAllListeners("sinewave-data");
            }
        };
    }, []);

    useEffect(() => {
        if (!sineWaveData) return; // Wait until data is ready

        // Setup p5.js sketch
        const sketch = (p: any) => {
            p.setup = () => {
                p.createCanvas(window.innerWidth, window.innerHeight);
            };

            p.draw = () => {
                p.background(255);

                if (sineWaveData && sineWaveData.x && sineWaveData.y) {
                    p.stroke(0);
                    p.noFill();
                    p.beginShape();

                    const xMax = sineWaveData.x[sineWaveData.x.length - 1] || 1;
                    const yMax =
                        Math.max(...sineWaveData.y.map((y) => Math.abs(y))) ||
                        1;

                    const xScale = p.width / xMax;
                    const yScale = p.height / (2 * yMax);

                    sineWaveData.x.forEach((xVal, i) => {
                        const wrappedX = (xVal * xScale) % p.width;
                        const yVal = sineWaveData.y[i];
                        const scaledY = p.height / 2 - yVal * yScale;

                        p.vertex(wrappedX, scaledY);
                    });

                    p.endShape();
                }
            };
        };

        const myp5 = new p5(sketch, canvasRef.current);

        return () => {
            myp5.remove();
        };
    }, [sineWaveData]);

    return <div ref={canvasRef}></div>;
};

export default App;
