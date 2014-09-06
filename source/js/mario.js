"use strict";
var mario = (function (marioDir) {
    var container,
        renderer,
        camera,
        scene,
        marios = [],
        MARIO_COUNT = 12,
        rotationsPerSecond = 0.3,
        marioFramesPerSecond = 9,
        skippedFrames = 2,
        currentFrame = 0;

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    function render() {
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    function animate(timestamp) {
        currentFrame += 1;

        if (! (currentFrame % skippedFrames)) {
            requestAnimationFrame(animate, renderer.domElement);

            return;
        }

        var rotation = deg2rad(((timestamp / 1000) * rotationsPerSecond * 360) % 360),
            currentMarioIndex = parseInt((timestamp / 1000) * marioFramesPerSecond) % MARIO_COUNT;

        for (var i in marios) {
            if (marios.hasOwnProperty(i)) {
                marios[i].visible    = (i == currentMarioIndex);
                marios[i].rotation.z = rotation;
            }
        }

        render();
        requestAnimationFrame(animate, renderer.domElement);
    }

    function init() {
        var VIEW_ANGLE = 45,
            NEAR = 0.1,
            FAR = 10000,
            $container = $('#shield-container'),
            pointLight = new THREE.PointLight(0xFFFFFF);

        renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});

        renderer.setClearColor(0x000000, 0);

        camera = new THREE.PerspectiveCamera(VIEW_ANGLE, $container.width() / $container.height(), NEAR, FAR);
        scene  = new THREE.Scene();

        scene.add(camera);

        camera.position.x = 30;
        camera.position.y = 300;

        renderer.setSize($container.width(), $container.height());

        $container.append(renderer.domElement);

        pointLight.position.x = 50;
        pointLight.position.y = 200;
        pointLight.position.z = 30;

        scene.add(pointLight);

        var texture = THREE.ImageUtils.loadTexture(marioDir + "/mario_tex.png");

        for (var i = 0; i < MARIO_COUNT; i += 1) {
            // encapsulating in a closure to avoid scope leakages on the iterator value
            (function (i) {
                (new THREE.OBJLoader())
                    .load(marioDir + "/Frame_" + (i + 1) + ".obj", function (geometries) {
                        var material = new THREE.MeshLambertMaterial({map: texture}),
                            shield = new THREE.Mesh(geometries.children[0].geometry, material);

                        shield.rotation.y = deg2rad(90);

                        shield.scale.set(10, 10, 10);
                        scene.add(shield);
                        shield.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(1.1, 0.5, 0));
                        shield.geometry.verticesNeedUpdate = true;
                        shield.visible = false;

                        marios[i] = shield;
                    });
            }(i));
        }

        requestAnimationFrame(animate, renderer.domElement);
    }

    init();
});
