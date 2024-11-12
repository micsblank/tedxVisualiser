import p5 from "p5";

let golShader: p5.Shader;
let golGraphics: p5.Graphics;
let pgolGraphics: p5.Graphics;

let topLevelShader: p5.Shader;
let ansoLogo: p5.Image;
let textGraphics: p5.Graphics;
let lineGraphics: p5.Graphics;

//let sweatImages: Array<p5.Image> = [];
//let sweatImageLookup: Record<number,p5.Image> = {};
let bgImages: Array<p5.Image> = [];
let blobs: p5.Image;

let kopisuInflated: p5.Image;
// let kopisuRound: p5.Image;
//let kopisuStraight: p5.Image;
let koupLogo: p5.Image;
let KSstu01: p5.Image;
// let KS_repeated: p5.Image;
let LineKOUP: p5.Image;
let bluebg:  p5.Image;
//let KSstu02: p5.Image;
//let KSstu03: p5.Image;
let k_letter:  p5.Image;
let o_letter:  p5.Image;
let u_letter:  p5.Image;
let p_letter:  p5.Image;
let cycle: boolean = false;
let startTime = 0;


let performanceMode: boolean = false;
let modeStep: number = 0;



let audioCtx: AudioContext;
let analyser: AnalyserNode;
let analyserSmooth: AnalyserNode;

let prerecord: HTMLAudioElement;


let loop: Array<p5.Vector> = [];
let loop2: Array<p5.Vector> = [];

let xOffset = 0.0;
let xOffset2 = 0.0;


// let imageLayer: Array<{
//     pos: p5.Vector,
//     drift: p5.Vector,
//     img: p5.Image,
//     expires: number,
// }>= []


const sketch = (p: p5) => {

    p.preload = () => {
        golShader = p.loadShader('shader.vert', 'gol.frag');
        topLevelShader = p.loadShader('shader.vert', 'toplevel.frag');
        ansoLogo = p.loadImage("AnSo_Logo.png");

        // for(let i=0; i<=20; i++) {
        //     let bgSweat = [20, 5, 14, 19, 18, 17, 4];
        //     if(bgSweat.indexOf(i) !== -1) 
        //         p.loadImage(`sweat_${p.nf(i, 2)}.jpg`, x=>{ bgImages.push(x); sweatImageLookup[i] = x; });
        //     else
        //         p.loadImage(`sweat_${p.nf(i, 2)}.jpg`, x=>{ sweatImages.push(x); sweatImageLookup[i] = x;});
        // }
        

        kopisuInflated = p.loadImage("KS_inflated.png");
        // kopisuRound = p.loadImage("KS_round.png");
        // kopisuStraight = p.loadImage("KS_straight.png");
        
        koupLogo = p.loadImage("KoupLogoPurple.png");
        KSstu01 = p.loadImage("band_img.png");
        
        // KS_repeated = p.loadImage("RepeatedKOUP.png");
        LineKOUP = p.loadImage("LineKOUP.png");

        k_letter = p.loadImage("K.png");
        o_letter = p.loadImage("O.png");
        u_letter = p.loadImage("U.png");
        p_letter = p.loadImage("P.png");
 
        bluebg = p.loadImage("bluebg.png");
        blobs = p.loadImage("blobs.png");
    }

    p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight+25, p.WEBGL);
        

        prerecord = document.getElementById("prerecord") as HTMLAudioElement;

        let r = 200
        for(let i=0; i<p.TWO_PI; i+=p.TWO_PI/30) {
            let x = p.sin(i)*r;
            let y = p.cos(i)*r;

            loop.push(p.createVector(x,y));
            loop2.push(p.createVector(y-300,x-100));
        }


        golGraphics = p.createGraphics(p.floor(p.width/20), p.floor(p.height/20), p.WEBGL);
        pgolGraphics = p.createGraphics(p.floor(p.width/20), p.floor(p.height/20), p.WEBGL);


        golGraphics.pixelDensity(1);
        pgolGraphics.pixelDensity(1);
        golGraphics.noSmooth();
        pgolGraphics.noSmooth();
        golGraphics.shader(golShader);
        golShader.setUniform("normalRes", [1.0/golGraphics.width, 1.0/golGraphics.height]);
        topLevelShader.setUniform("golRes", [golGraphics.width, golGraphics.height]);

        pgolGraphics.stroke(255);


        textGraphics = p.createGraphics(p.width, p.height, p.WEBGL);
        textGraphics.image(ansoLogo, -p.width/2*.6 , -p.height/2*.3, p.width*.6, p.height*.3);

        lineGraphics = p.createGraphics(p.width, p.height, p.WEBGL);
    }

    // Add a function to resize the canvas
    function resizeSketchCanvas() {
        p.resizeCanvas(window.innerWidth, window.innerHeight + 25);
    }

    p.draw = () => {

        p.noCursor();

        p.background(0);
        const spacing = 10; // Space between each letter
        const imgWidth = p.height * 0.76; // Width of each letter image
        const totalWidth = (imgWidth + spacing) * 4; 
        // calc the smoothedVolume
        let amp = 0;
        let exaggeratedBassAmp = 0;
        // Assuming you already have a spectrum array and bufferLength

// Use a power or multiplier to exaggerate bass effect
// Adjust 2 and 2 for the desired effect
        if(analyserSmooth) {
            const bufferLength = analyserSmooth.frequencyBinCount;
            const spectrum = new Uint8Array(bufferLength);
            analyserSmooth.getByteFrequencyData(spectrum);
            amp = spectrum.reduce((a,b) => a+b) / bufferLength / 128;
            // const bassAmp = spectrum.reduce((a, b) => a + b, 0) / bassBinCount / 128;
            // amp = Math.pow(bassAmp, 2); 
        }

        // set shader uniforms
        topLevelShader.setUniform("golRes", 
            [golGraphics.width, golGraphics.height]);
        topLevelShader.setUniform("textGraphics", textGraphics);
        topLevelShader.setUniform("lineGraphics", lineGraphics);
        topLevelShader.setUniform("amplitude", amp);
        topLevelShader.setUniform("exaggeratedBassAmp", exaggeratedBassAmp);
        
        topLevelShader.setUniform("time", p.millis()/1000);
        topLevelShader.setUniform("performanceMode", performanceMode);
        topLevelShader.setUniform("modeStep", modeStep);
        topLevelShader.setUniform("gol", golGraphics);

       //
        if (startTime > 0) {  // Only update the shader if 'A' has been pressed
            let elapsedTime = (p.millis() - startTime) / 1000;  // Calculate elapsed time in seconds
            topLevelShader.setUniform("time", elapsedTime);  // Pass the elapsed time to the shader
        }
        

        if(bgImages.length > 0 && performanceMode) {

            topLevelShader.setUniform("bgImage", bgImages[p.floor(p.frameCount/400)%bgImages.length]);
        }


        // calc game of life
        if(p.frameCount%5 == 0) {
            golStep(p, amp);
        }



        if(performanceMode) {
            // @ts-ignore
            lineGraphics.clear();
            // @ts-ignore
            textGraphics.clear();

            if(modeStep > 0)
            for(let i=0; i<2; i++)
                lineGraphics.image(kopisuInflated, -p.width/2*3.9 + p.cos(p.frameCount/8000 + modeStep*p.HALF_PI)*2000 , -p.height/2*1.0, p.width*3.9, p.height*1.0);
            else {
                drawLoop(lineGraphics,loop, p.frameCount/300,  (p.frameCount % 80)/80);

                drawLoop(lineGraphics,loop2, p.frameCount/300, (p.frameCount % 100)/100);

                if(performanceMode) {
                    if(p.frameCount%400 < 200){
                        fold(loop, p);
                        fold(loop2, p);
                    }else{
                        unfold(loop, p);
                        unfold(loop2, p);
                    }

                    let normals = calcNormals(loop);
                    loop.forEach((v,i) => {

                        //v.sub(v.copy().mult(.005));
                        v.sub(normals[i].mult(0.2));
                    });
                }
            }

            //textGraphics.image(ansoLogo, -p.width/2*.6 , -p.height/2*.3, p.width*.6, p.height*.3);
            //drawImage(textGraphics, 9, .7, .3);
            //
            if(modeStep > 2)
                // lineGraphics.clear();
            // @ts-ignore
            // textGraphics.clear();
                textGraphics.image(koupLogo, -p.height/2*1.2 , -p.height/2*.3, p.height*1.2, p.height*.3);
                // textGraphics.image(k_letter, -p.width/2*.6 , -p.height/2*.3, p.width*.6/4, p.height*.3);
                // textGraphics.image(o_letter, -p.width/2*.6 + p.width*.6/4, -p.height/2*.3, p.width*.6/4, p.height*.3);
                // textGraphics.image(u_letter, -p.width/2*.6 +2*p.width*.6/4, -p.height/2*.3, p.width*.6/4, p.height*.3);
                // textGraphics.image(p_letter, -p.width/2*.6 +3*p.width*.6/4, -p.height/2*.3, p.width*.6/4, p.height*.3);
                

        } else { // holding state
            // let w:number = 400;
            // let h:number = 223;
            //line
            // @ts-ignore
            textGraphics.clear();
            //
            if (cycle == true) {
                if(p.frameCount %600*3*2 == 0) {
                    modeStep = (modeStep +1) % 10;
                }
            }


            // @ts-ignore
            lineGraphics.clear();


            // drawLoop(lineGraphics, loop);
            // drawLoop(lineGraphics, loop2);
            //lineGraphics.image(blobs, -p.width/2*1.1 , -p.height/2*1.1, p.width*1.1, p.height*1.1);
            //
   
           

            if(modeStep == 0) {
                xOffset -= 2; // Adjust the speed by changing this value
            
                // Draw the image with xOffset applied
                lineGraphics.image(LineKOUP, xOffset - p.width / 2 * 0.99, -p.height / 2 * 0.95, p.height * 3.0, p.height * 0.95);
                lineGraphics.image(LineKOUP, (xOffset - p.width / 2 * 0.99) + p.height * 3.0 + 2, -p.height / 2 * 0.95, p.height * 3.0, p.height * 0.95);
                
                // Reset xOffset to start again when it goes off-screen
                if (xOffset < (-(p.height * 3.0 + 2))) {
                  xOffset =  0;
                }

                topLevelShader.setUniform("bgImage", bluebg);
            }

            if(modeStep == 1) {
                xOffset -= 2;
                xOffset2 -= 2;

                    // Wrap xOffset back to the beginning for continuous flow
                    if (xOffset <= -totalWidth) {
                        xOffset = totalWidth;
                        console.log(-totalWidth -10)
                        console.log("2, 1", xOffset2, xOffset)
                    }
                    if (xOffset2 <= -totalWidth*2) {
                        xOffset2 = 0;
                        console.log(xOffset2, xOffset)
                    }

                    // Calculate positions and draw each letter based on xOffset
                    lineGraphics.image(k_letter, xOffset + (imgWidth + spacing) * 0 - p.width / 2 * 0.99, -p.height / 2 * 0.95, imgWidth, p.height * 0.95);
                    lineGraphics.image(o_letter, xOffset + (imgWidth + spacing) * 1 - p.width / 2 * 0.99, -p.height / 2 * 0.95, imgWidth, p.height * 0.95);
                    lineGraphics.image(u_letter, xOffset + (imgWidth + spacing) * 2 - p.width / 2 * 0.99, -p.height / 2 * 0.95, imgWidth, p.height * 0.95);
                    lineGraphics.image(p_letter, xOffset + (imgWidth + spacing) * 3 - p.width / 2 * 0.99, -p.height / 2 * 0.95, imgWidth, p.height * 0.95);
                    
                    lineGraphics.image(k_letter, xOffset2 + (imgWidth + spacing) * 4 - p.width / 2 * 0.99, -p.height / 2 * 0.95, imgWidth, p.height * 0.95);
                    lineGraphics.image(o_letter, xOffset2 + (imgWidth + spacing) * 5 - p.width / 2 * 0.99, -p.height / 2 * 0.60, imgWidth, p.height * 0.95);
                    lineGraphics.image(u_letter, xOffset2 + (imgWidth + spacing) * 6 - p.width / 2 * 0.99, -p.height / 2 * 0.95, imgWidth, p.height * 0.95);
                    lineGraphics.image(p_letter, xOffset2 + (imgWidth + spacing) * 7 - p.width / 2 * 0.99, -p.height / 2 * 0.95, imgWidth, p.height * 0.95);

                    // Optional: Clear and set uniforms if needed
                    topLevelShader.setUniform("bgImage", bluebg);
            }

            if(modeStep == 2) {
                for(let i=0; i<2; i++)
                lineGraphics.image(kopisuInflated, -p.width/2*3.9 + p.sin(p.frameCount/4000)*1000 , -p.height/2*1.0, p.width*3.9, p.height*1.0);

                topLevelShader.setUniform("bgImage", KSstu01);

                // textGraphics.image(ansoLogo, textGraphics.width*.7 - textGraphics.width/2, textGraphics.height*.3 - textGraphics.height/2,p.width*0.5 , p.height*0.5);
                if(p.frameCount %600*3*2 > 600) drawImage(textGraphics, 9, .8, .1, p.createVector(-2,1).mult(0.02).mult(p.frameCount %600*3*2));
                if(p.frameCount %600*3*2 > 600*2)drawImage(textGraphics, 8, .8, .7);
            }

            if(modeStep == 3) {

                for(let i=0; i<2; i++)
                lineGraphics.image(kopisuInflated, -p.width/2*3.9 + p.sin(p.frameCount/4000 + p.HALF_PI)*1000 , -p.height/2*1.0, p.width*3.9, p.height*1.0);

                if(p.frameCount %600*3*2 > 600) drawImage(textGraphics, 11, .1, .8);
                if(p.frameCount %600*3*2 > 600*2) drawImage(textGraphics, 10, .2, .2, p.createVector(0.5,-1).mult(0.02).mult(p.frameCount %600*3*2));
                if(p.frameCount %600*3*2 > 600*3) drawImage(textGraphics, 6, .75, .8, p.createVector(-2,2).mult(0.02).mult(p.frameCount %600*3*2));
                if(p.frameCount %600*3*2 > 600*4) drawImage(textGraphics, 7, .85, .17, p.createVector(1,1.2).mult(0.02).mult(p.frameCount %600*3*2));

                topLevelShader.setUniform("bgImage", KSstu01);
            }
            
            if(modeStep == 4) {
                lineGraphics.image(blobs, -p.width/2*1.28 , -p.height/2*1.33, p.width*1.28, p.height*1.33);
                if(p.frameCount %600*3*2 > 600) drawImage(textGraphics, 3, .25, .2,p.createVector(1,.2).mult(0.02).mult(p.frameCount %600*3*2));
                if(p.frameCount %600*3*2 > 600*2) drawImage(textGraphics, 12, .7, .7, p.createVector(-2,-1.2).mult(0.02).mult(p.frameCount %600*3*2));

                topLevelShader.setUniform("bgImage", KSstu01);
            }


            if(modeStep == 5) {

                for(let i=0; i<2; i++)
                lineGraphics.image(kopisuInflated, -p.width/2*3.9 + p.sin(p.frameCount/4000 - p.HALF_PI)*1000 , -p.height/2*1.0, p.width*3.9, p.height*1.0);

                if(p.frameCount %600*3*2 > 600) drawImage(textGraphics, 1, .35, .7, p.createVector(0,1.2).mult(0.02).mult(p.frameCount %600*3*2));
                if(p.frameCount %600*3*2 > 600*2) drawImage(textGraphics, 0, .75, .20);


                topLevelShader.setUniform("bgImage", KSstu01);
            }

            if(modeStep == 6) {

                for(let i=0; i<2; i++)
                lineGraphics.image(kopisuInflated, -p.width/2*3.9 + p.sin(p.frameCount/4000)*1000 , -p.height/2*1.0, p.width*3.9, p.height*1.0);

                if(p.frameCount %600*3*2 > 600*2) drawImage(textGraphics, 9, .15, .8, p.createVector(2,1.2).mult(0.02).mult(p.frameCount %600*3*2));
                if(p.frameCount %600*3*2 > 600) drawImage(textGraphics, 13, .85, .10, p.createVector(1,-1.2).mult(0.02).mult(p.frameCount %600*3*2));


                topLevelShader.setUniform("bgImage", KSstu01);
            }

 
            if(modeStep == 7) {

                //add sweat
                // if(p.frameCount %600*3*2 > 600) drawImage(textGraphics, 2, .80, .7, p.createVector(1,2.2).mult(0.02).mult(p.frameCount %600*3*2));
                //if(p.frameCount %600*3*2 > 600*2) drawImage(textGraphics, 15, .20, .20, p.createVector(-1,1.2).mult(0.02).mult(p.frameCount %600*3*2));

                // lineGraphics.image(kopisuRound, -p.width/2*0.99 , -p.height/2*1.10, p.width*0.99, p.height*1.05);
                //for(let i=0; i<2; i++) lineGraphics.image(koupLogo, -p.width/2*0.9 , -p.height/2*.6, p.width*0.9, p.height*.6);
                
                topLevelShader.setUniform("bgImage", KSstu01);
                //drawImage(textGraphics, 15, .20, .20, p.createVector(-1,1.2).mult(0.02).mult(p.frameCount %600*3*2));
                lineGraphics.image(koupLogo, -p.width/2*0.7 , -p.height/2*.33, p.width*0.7, p.height*.33);
    
                
            }
            if(modeStep == 8) {
                for(let i=0; i<2; i++) lineGraphics.image(koupLogo, -p.width/2*0.9 , -p.height/2*.6, p.width*0.9, p.height*.6);
                //if(p.frameCount %600*3*2 > 600) drawImage(textGraphics, 9, .15, .8);
                //if(p.frameCount %600*3*2 > 600*2) drawImage(textGraphics, 13, .85, .10, p.createVector(-1,1.2).mult(0.02).mult(p.frameCount %600*3*2));

                topLevelShader.setUniform("bgImage", KSstu01);
            }

            if(modeStep == 9) {
                lineGraphics.image(koupLogo, -p.width/2*0.9 , -p.height/2*.33, p.width*0.9, p.height*.33);

                topLevelShader.setUniform("bgImage",  KSstu01);
            }

            // @ts-ignore

            /*imageLayer.forEach(x => {
                x.pos.add(x.drift);
                let w = 400;
                let h = 223;
                textGraphics.image(x.img, x.pos.x, x.pos.y, w, h);

                if(x.pos.x < -p.width/2) x.drift.x = -x.drift.x;
                if(x.pos.x+w > p.width/2) x.drift.x = -x.drift.x;
                if(x.pos.y < -p.height/2) x.drift.y = -x.drift.y;
                if(x.pos.y+h > p.height/2) x.drift.y = -x.drift.y;
            });
            imageLayer = imageLayer.filter(x => x.expires > p.millis());*/



            /*if(p.frameCount % 200 == 0) {
                let options = [...sweatImages, ...bgImages].filter(x=>imageLayer.map(y=>y.img).indexOf(x) === -1);
                let nextImg = options[p.floor(p.random(options.length))];
                if(nextImg)
                imageLayer.push({
                    pos: p.createVector(p.random(p.width - 400)-p.width/2, p.random(p.height - 400)-p.height/2),
                    drift: p.createVector(p.random(-2,2), p.random(-2,2)),
                    img: nextImg,
                    expires: p.millis() + 1000 * 8 + p.random(1000*8)
                });
            }*/
                //lineGraphics.image(blobs, -p.width/2*0.98 , -p.height/2*.83, p.width*0.98, p.height*.83);
            //textGraphics.image(sweatImages[0], -500, -300, 400, 300);


            //lineGraphics.image(kopisuRound, -p.width/2*.8 , -p.height/2*.6, p.width*.8, p.height*.6);
        }

        // blob(p);
        //blob(p, 50);
        //
        // drawLoop(p, loop);
        // drawLoop(p, loop2);

        // loop.forEach((v,i) => {
        //     v.sub(p.createVector(
        //         p.sin(p.noise(p.sin(i/loop.length*p.TWO_PI)*20, p.frameCount/100) *p.TWO_PI),
        //         p.cos(p.noise(p.sin(i/loop.length*p.TWO_PI)*20, p.frameCount/100)*p.TWO_PI)).setMag(0.3));
        // });
        // loop.forEach((v,i) => {
        //     v.add(p.createVector(
        //         p.sin(p.random(p.sin(i/loop.length*p.TWO_PI), p.frameCount/1) *p.TWO_PI),
        //         p.cos(p.random(p.sin(i/loop.length*p.TWO_PI), p.frameCount/1)*p.TWO_PI)));
        // });
        //
        //if(p.frameCount > 200) loop.pop();




        // top level shader puts all the pieces together
        p.fill(255);
        p.shader(topLevelShader);
        p.rect(-p.width/2,-p.height/2,p.width,p.height);

    }

    p.keyPressed = () => {
        console.log(p.keyCode);

        if(p.keyCode == 70) { // f - go fullscreen
            openFullscreen();
        }

        if(p.keyCode == 65) { // a - start audio input
            setupAudio(false);
            startTime = p.millis(); 

            prerecord.play();
        }

        if(p.keyCode == 77) { // m - for mic
            setupAudio(true);
        }

        if(p.keyCode == 80) { // p - performance
            performanceMode = true;
            modeStep = 0;
            p.frameCount = 0;
        }

        if(p.keyCode == 72) { // h - holding screen
            performanceMode = false;
            modeStep = 0;
        }

        if(performanceMode || true) {

            if(!performanceMode) p.frameCount = 0;

            if(p.keyCode == 49) { // 1
                modeStep = 1;
            }

            if(p.keyCode == 50) { // 2
                modeStep = 2;
            }

            if(p.keyCode == 51) { // 3
                modeStep = 3;
            }

            if(p.keyCode == 52) { // 4
                modeStep = 4;
            }

            if(p.keyCode == 53) { // 5
                modeStep = 5;
            }

            if(p.keyCode == 54) { // 6
                modeStep = 6;
            }

            if(p.keyCode == 55) { // 7
                modeStep = 7;
            }
            if(p.keyCode == 56) { // 8
                modeStep = 8;
            }
            if(p.keyCode == 57) { // 9
                modeStep = 9;
            }
        }

    }
}


function drawImage(g: p5, n: number, x:number, y: number, drift?: p5.Vector) {
    n= n+1;
    g.image(KSstu01, (g.width-400)*x - g.width/2 + (drift?.x ?? 0), (g.height-223)*y - g.height/2+ (drift?.y ?? 0), 400, 223);
}

function calcNormals(arr:Array<p5.Vector>):Array<p5.Vector> {
    return arr.map((_,i) => {
        let before = arr[(i+arr.length-1)%arr.length];
        let after = arr[(i+1)%arr.length];
        let diff = p5.Vector.sub(before, after).normalize().rotate(3.1415/2);
        //p.line(x.x,x.y, x.x+diff.x,x.y+diff.y);
        return diff;
    })
}

function unfold(arr:Array<p5.Vector>, p: p5):void {
    arr.map((x,i) => {
        let before = arr[(i+loop.length-1)%arr.length];
        let after = arr[(i+1)%arr.length];
        let mid = p5.Vector.lerp(before, after, 0.5);
        //p.line(x.x,x.y, x.x+diff.x,x.y+diff.y);
        x.lerp(mid, 0.02*p.noise(x.x,x.y));
    })
}
function fold(arr:Array<p5.Vector>, p: p5):void {
    arr.forEach((v) => {
        v.add(p.createVector(
            p.sin(p.noise(v.x/20,v.y/20)*p.TWO_PI*2),
            p.cos(p.noise(v.x/20,v.y/20)*p.TWO_PI*2)
        ).mult(0.2));
    });
}

function drawLoop(p: p5, loop: Array<p5.Vector>, fullness = 0, completeness = 0) {

    p.noFill();
    p.stroke(255);
    let normals = calcNormals(loop);

    for(let i=0; i<fullness; i++) {
        let mag = p.sq(i*2);
        p.beginShape();
        loop.map((v,idx) => {
          if((idx + i)/loop.length < completeness) p.curveVertex(v.x+normals[idx].x*mag,v.y+normals[idx].y*mag);
        });
        p.endShape(completeness >= 1?p.CLOSE:undefined);
    }
}


function golStep(p: p5, amp: number) {

        golShader.setUniform("tex", pgolGraphics);
            golGraphics.rect(-golGraphics.width/2,-golGraphics.height/2,golGraphics.width,golGraphics.height);
            pgolGraphics.image(golGraphics.get(), -pgolGraphics.width/2, -pgolGraphics.height/2, pgolGraphics.width, pgolGraphics.height);
            
            for(let i=0; i<amp/5; i++) {
        let x = p.random(pgolGraphics.width) - pgolGraphics.width/2;
        let y = p.random(pgolGraphics.height) - pgolGraphics.height/2;
        if(modeStep<5) {
            pgolGraphics.line(
                x,y, x+4, y)
            ;
        } else {
            pgolGraphics.line(
                x,y, x+p.random(50), y+p.random(50))
            ;
        }
    }
}

/*function blob(p: p5, off = 0) {

    for(let j=1; j<8; j++) {
        let r = 200 - p.sq(j/2)*(5+p.sin(p.frameCount/30 + off));

        p.push();

        p.translate(
            p.sin(p.noise(j/200 + off,-100,p.frameCount/590)*p.TWO_PI)*p.width/2,
            p.cos(p.noise(50+j/200 + off,50,p.frameCount/590)*p.TWO_PI)*p.height/2,
        );
        p.beginShape();
        for(let i=0; i<p.TWO_PI; i+=p.TWO_PI/60) {
            let x = p.sin(i+off)*r + p.noise(off, p.sin(i+off)/3, p.frameCount/120.)*220;
            let y = p.cos(i+off)*r+ p.noise(off, p.cos(i+off)/3, p.frameCount/120.)*220;
            //x += p.noise(x/200,y/200,p.frameCount/200.)*150;
            //y += p.noise(x,y,p.frameCount/200.)*50;
            p.vertex(
                x,y
            );
        }
        p.endShape(p.CLOSE);
        p.pop();
    }
}*/


// @ts-ignore;
function openFullscreen() {
    document.documentElement.requestFullscreen();
} 



function setupAudio(mic:boolean) {

    if(!audioCtx)
      audioCtx = new AudioContext();

    // polyfill
    // @ts-ignore
    if (!navigator.getUserMedia)
        // @ts-ignore
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    // @ts-ignore
    if (navigator.getUserMedia) {

        // @ts-ignore
      navigator.getUserMedia({ audio:true }, 
            //@ts-ignore
        function(stream:MediaStream) {
            let source
            if(mic)
                source = audioCtx.createMediaStreamSource(stream);
            else
                source = audioCtx.createMediaElementSource(prerecord);

          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 2048;
          analyser.smoothingTimeConstant = 0;

          analyserSmooth = audioCtx.createAnalyser();
          analyserSmooth.fftSize = 2048;
          analyserSmooth.smoothingTimeConstant = 0.8;

          if(mic) {
            const gainNode = audioCtx.createGain();
                    gainNode.gain.value = 0.1;
          source.connect(gainNode);
          gainNode.connect(analyser);
          gainNode.connect(analyserSmooth);
          } else {
          source.connect(analyser);
          source.connect(analyserSmooth);
          source.connect(audioCtx.destination);
          }
        },
        function() {
          alert('Error capturing audio.');
        }
      );

    } else { alert('getUserMedia not supported in this browser.'); }
}


new p5(sketch);
