import p5 from "p5";
import React, { useEffect, useRef, useState } from "react";

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
        if (!sineWaveData) return;

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

                    const xMin = Math.min(...sineWaveData.x);
                    const xMax = Math.max(...sineWaveData.x);
                    const yMin = Math.min(...sineWaveData.y);
                    const yMax = Math.max(...sineWaveData.y);

                    const xScale = p.width / (xMax - xMin);
                    const yScale = (p.height * 0.8) / (yMax - yMin);

                    sineWaveData.x.forEach((xVal, i) => {
                        const yVal = sineWaveData.y[i];

                        const scaledX = (xVal - xMin) * xScale;
                        const scaledY = p.height / 2 - (yVal * yScale);

                        p.vertex(scaledX, scaledY);
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
