import { Annotation, Canvas, Utils } from "manifesto.js";
import { AVComponentUtils } from "./Utils";

export class VirtualCanvas {
    
    public canvases: Canvas[] = [];
    public id: string;

    constructor() {
        // generate an id
        this.id = AVComponentUtils.getTimestamp();
    }

    public addCanvas(canvas: Canvas): void {
        // canvases need to be deep copied including functions
        this.canvases.push(jQuery.extend(true, {}, canvas));
    }

    public getContent(): Annotation[] {

        const annotations: Annotation[] = [];

        this.canvases.forEach((canvas: Canvas) => {
            const items: Annotation[] = canvas.getContent();

            // if the annotations have no temporal target, add one so that
            // they specifically target the duration of their canvas
            items.forEach((item: Annotation) => {
                const target: string | null = item.getTarget();

                if (target) {
                    let t: number[] | null = Utils.getTemporalComponent(target);
                    if (!t) {
                        item.__jsonld.target += '#t=0,' + canvas.getDuration();
                    }
                }
                
            });

            items.forEach((item: Annotation) => {
                const target: string | null = item.getTarget();

                if (target) {
                    item.__jsonld.target = AVComponentUtils.retargetTemporalComponent(this.canvases, target);                        
                }
            });

            annotations.push(...items);
        });

        return annotations;
    }

    getDuration(): number | null {

        let duration: number = 0;

        this.canvases.forEach((canvas: Canvas) => {
            const d: number | null = canvas.getDuration();
            if (d) {
                duration += d;
            }
        });
        
        return duration;
    }

    getWidth(): number {
        if (this.canvases.length) {
            return this.canvases[0].getWidth();
        }
        return 0;
    }

    getHeight(): number {
        if (this.canvases.length) {
            return this.canvases[0].getHeight();
        }
        return 0;
    }
}