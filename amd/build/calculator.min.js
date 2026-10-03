// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * calculator.js
 *
 * @package   mod_triangle
 * @copyright 2026 Eduardo Kraus {@link https://eduardokraus.com}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/* eslint-disable no-mixed-operators */
define(["core/templates", "core/notification"], function (Templates, Notification) {
    const EPS = 0.000001;
    const ANGLE_EPS = 0.01;
    const SIDE_LIMIT = 1000000000000;
    const FIELDS = ["a", "b", "c", "A", "B", "C"];
    const SIDES = ["a", "b", "c"];
    const ANGLES = ["A", "B", "C"];

    const degToRad = value => value * Math.PI / 180;
    const radToDeg = value => value * 180 / Math.PI;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const round = value => Number.parseFloat(Number(value).toPrecision(10));
    const fmt = value => Number.isFinite(value) ? String(round(value)) : "-";

    const validTriangle = triangle => {
        if (!triangle || !FIELDS.every(field => Number.isFinite(triangle[field]))) {
            return false;
        }
        if (SIDES.some(field => triangle[field] <= 0) || ANGLES.some(field => triangle[field] <= 0)) {
            return false;
        }
        if (Math.abs(triangle.A + triangle.B + triangle.C - 180) > 0.001) {
            return false;
        }
        return triangle.a + triangle.b > triangle.c + EPS &&
            triangle.a + triangle.c > triangle.b + EPS &&
            triangle.b + triangle.c > triangle.a + EPS;
    };

    const fromSSS = values => {
        const {a, b, c} = values;
        if (![a, b, c].every(Number.isFinite) || a + b <= c || a + c <= b || b + c <= a) {
            return [];
        }
        const A = radToDeg(Math.acos(clamp((b * b + c * c - a * a) / (2 * b * c), -1, 1)));
        const B = radToDeg(Math.acos(clamp((a * a + c * c - b * b) / (2 * a * c), -1, 1)));
        const C = 180 - A - B;
        return [{a, b, c, A, B, C, method: "SSS"}];
    };

    const fromTwoAnglesAndSide = values => {
        const knownAngles = ANGLES.filter(field => Number.isFinite(values[field]));
        const knownSides = SIDES.filter(field => Number.isFinite(values[field]));
        if (knownAngles.length < 2 || knownSides.length < 1) {
            return [];
        }

        const angles = {...values};
        const missingAngle = ANGLES.find(field => !Number.isFinite(angles[field]));
        if (missingAngle) {
            const sum = knownAngles.reduce((total, field) => total + angles[field], 0);
            angles[missingAngle] = 180 - sum;
        }
        if (angles.A <= 0 || angles.B <= 0 || angles.C <= 0 || Math.abs(angles.A + angles.B + angles.C - 180) > 0.001) {
            return [];
        }

        const referenceSide = knownSides[0];
        const referenceAngle = referenceSide.toUpperCase();
        const ratio = values[referenceSide] / Math.sin(degToRad(angles[referenceAngle]));
        const triangle = {
            A: angles.A,
            B: angles.B,
            C: angles.C,
            a: ratio * Math.sin(degToRad(angles.A)),
            b: ratio * Math.sin(degToRad(angles.B)),
            c: ratio * Math.sin(degToRad(angles.C)),
            method: "AAS/ASA",
        };
        return validTriangle(triangle) ? [triangle] : [];
    };

    const fromSAS = values => {
        const cases = [
            {s1: "b", s2: "c", angle: "A", target: "a"},
            {s1: "a", s2: "c", angle: "B", target: "b"},
            {s1: "a", s2: "b", angle: "C", target: "c"},
        ];
        const out = [];
        cases.forEach(item => {
            if (![values[item.s1], values[item.s2], values[item.angle]].every(Number.isFinite)) {
                return;
            }
            const side = Math.sqrt(
                values[item.s1] ** 2 + values[item.s2] ** 2 -
                2 * values[item.s1] * values[item.s2] * Math.cos(degToRad(values[item.angle]))
            );
            const sides = {...values, [item.target]: side};
            fromSSS(sides).forEach(triangle => out.push({...triangle, method: "SAS"}));
        });
        return out;
    };

    const fromSSA = values => {
        const out = [];
        ANGLES.forEach(angleField => {
            const oppositeSide = angleField.toLowerCase();
            if (!Number.isFinite(values[angleField]) || !Number.isFinite(values[oppositeSide])) {
                return;
            }
            SIDES.forEach(otherSide => {
                if (otherSide === oppositeSide || !Number.isFinite(values[otherSide])) {
                    return;
                }
                const otherAngle = otherSide.toUpperCase();
                const remainingSide = SIDES.find(side => side !== oppositeSide && side !== otherSide);
                const remainingAngle = remainingSide.toUpperCase();
                const sinOther = values[otherSide] * Math.sin(degToRad(values[angleField])) / values[oppositeSide];
                if (sinOther <= 0 || sinOther > 1 + 1e-10) {
                    return;
                }
                const principal = radToDeg(Math.asin(clamp(sinOther, -1, 1)));
                [principal, 180 - principal].forEach(candidateAngle => {
                    const lastAngle = 180 - values[angleField] - candidateAngle;
                    if (lastAngle <= 0) {
                        return;
                    }
                    const lastSide = values[oppositeSide] * Math.sin(degToRad(lastAngle)) /
                        Math.sin(degToRad(values[angleField]));
                    const triangle = {
                        a: NaN, b: NaN, c: NaN, A: NaN, B: NaN, C: NaN,
                        [oppositeSide]: values[oppositeSide],
                        [otherSide]: values[otherSide],
                        [remainingSide]: lastSide,
                        [angleField]: values[angleField],
                        [otherAngle]: candidateAngle,
                        [remainingAngle]: lastAngle,
                        method: "SSA",
                    };
                    if (validTriangle(triangle)) {
                        out.push(triangle);
                    }
                });
            });
        });
        return out;
    };

    const matchesKnown = (triangle, known) => FIELDS.every(field => {
        if (!Number.isFinite(known[field])) {
            return true;
        }
        const tolerance = ANGLES.includes(field) ? 0.03 : Math.max(0.00001, Math.abs(known[field]) * 0.00001);
        return Math.abs(triangle[field] - known[field]) <= tolerance;
    });

    const sameTriangle = (left, right) => FIELDS.every(field => Math.abs(left[field] - right[field]) < 0.0001);

    const solve = known => {
        const candidates = [];
        [
            ...fromSSS(known),
            ...fromTwoAnglesAndSide(known),
            ...fromSAS(known),
            ...fromSSA(known),
        ].forEach(candidate => {
            if (validTriangle(candidate) && matchesKnown(candidate, known) && !candidates.some(existing => sameTriangle(existing, candidate))) {
                candidates.push(candidate);
            }
        });
        return candidates;
    };

    const inputNumber = input => {
        if (!input || input.value.trim() === "") {
            return NaN;
        }
        const value = Number(input.value);
        return Number.isFinite(value) ? value : NaN;
    };

    const getKnown = (root, manual) => {
        const known = {};
        FIELDS.forEach(field => {
            const input = root.querySelector(`[data-field="${field}"]`);
            known[field] = manual[field] ? inputNumber(input) : NaN;
        });
        return known;
    };

    const updateBounds = (root, manual) => {
        SIDES.forEach(field => {
            const input = root.querySelector(`[data-field="${field}"]`);
            const others = SIDES.filter(item => item !== field);
            const values = others.map(item => manual[item] ? inputNumber(root.querySelector(`[data-field="${item}"]`)) : NaN);
            let min = EPS;
            let max = SIDE_LIMIT;
            if (values.every(Number.isFinite)) {
                min = Math.abs(values[0] - values[1]) + EPS;
                max = Math.max(min, values[0] + values[1] - EPS);
            }
            input.min = String(round(min));
            input.max = String(round(max));
        });

        ANGLES.forEach(field => {
            const input = root.querySelector(`[data-field="${field}"]`);
            const others = ANGLES.filter(item => item !== field);
            const sum = others.reduce((total, item) => {
                if (!manual[item]) {
                    return total;
                }
                const value = inputNumber(root.querySelector(`[data-field="${item}"]`));
                return total + (Number.isFinite(value) ? value : 0);
            }, 0);
            const max = Math.max(ANGLE_EPS, 180 - sum - ANGLE_EPS);
            input.min = String(ANGLE_EPS);
            input.max = String(round(max));
        });
    };

    const setComputedValues = (root, manual, triangle) => {
        FIELDS.forEach(field => {
            const input = root.querySelector(`[data-field="${field}"]`);
            if (!manual[field]) {
                input.value = fmt(triangle[field]);
                input.classList.add("triangle-calculated");
            } else {
                input.classList.remove("triangle-calculated");
            }
        });
    };

    const clearComputedValues = (root, manual) => {
        FIELDS.forEach(field => {
            const input = root.querySelector(`[data-field="${field}"]`);
            if (!manual[field]) {
                input.value = "";
                input.classList.remove("triangle-calculated");
            }
        });
    };

    const point = (x, y) => ({x, y});
    const sideLength = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

    const getDisplayTriangle = triangle => {
        const width = 640;
        const height = 440;
        const margin = 88;
        const a = triangle && triangle.a > 0 ? triangle.a : 1;
        const b = triangle && triangle.b > 0 ? triangle.b : 1;
        const c = triangle && triangle.c > 0 ? triangle.c : 1;
        const rawX = (b * b + c * c - a * a) / (2 * c);
        const rawY = Math.sqrt(Math.max(EPS, b * b - rawX * rawX));
        const minX = Math.min(0, c, rawX);
        const maxX = Math.max(0, c, rawX);
        const rawWidth = Math.max(EPS, maxX - minX);
        const rawHeight = Math.max(EPS, rawY);
        const scale = Math.min((width - margin * 2) / rawWidth, (height - margin * 2) / rawHeight);
        const offsetX = (width - rawWidth * scale) / 2 - minX * scale;
        const baseY = height - margin;
        return {
            A: point(offsetX, baseY),
            B: point(offsetX + c * scale, baseY),
            C: point(offsetX + rawX * scale, baseY - rawY * scale),
            width,
            height,
        };
    };

    const placeSideInput = (root, selector, p1, p2, width, height) => {
        const wrap = root.querySelector(selector);
        const middle = point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        const length = sideLength(p1, p2);
        wrap.style.left = `${middle.x / width * 100}%`;
        wrap.style.top = `${middle.y / height * 100}%`;
        wrap.style.width = `${Math.max(72, length - 52) / width * 100}%`;
        wrap.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    };

    const placeAngleInput = (root, selector, vertex, centroid, width, height) => {
        const wrap = root.querySelector(selector);
        const dx = centroid.x - vertex.x;
        const dy = centroid.y - vertex.y;
        const distance = Math.hypot(dx, dy) || 1;
        const target = point(vertex.x + dx / distance * 72, vertex.y + dy / distance * 58);
        wrap.style.left = `${target.x / width * 100}%`;
        wrap.style.top = `${target.y / height * 100}%`;
        wrap.style.transform = "translate(-50%, -50%)";
    };

    const drawTriangle = (root, triangle) => {
        const shape = getDisplayTriangle(triangle);
        const {A, B, C, width, height} = shape;
        const svg = root.querySelector(".triangle-svg");
        svg.querySelector(".triangle-shape").setAttribute("points", `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`);

        [["a", A], ["b", B], ["c", C]].forEach(([name, vertex]) => {
            const circle = svg.querySelector(`.triangle-vertex-${name}`);
            circle.setAttribute("cx", vertex.x);
            circle.setAttribute("cy", vertex.y);
            const label = svg.querySelector(`.label-${name}`);
            const offsets = name === "a" ? [-18, 28] : name === "b" ? [18, 28] : [0, -22];
            label.setAttribute("x", vertex.x + offsets[0]);
            label.setAttribute("y", vertex.y + offsets[1]);
        });

        placeSideInput(root, ".side-a-wrap", B, C, width, height);
        placeSideInput(root, ".side-b-wrap", C, A, width, height);
        placeSideInput(root, ".side-c-wrap", A, B, width, height);

        const centroid = point((A.x + B.x + C.x) / 3, (A.y + B.y + C.y) / 3);
        placeAngleInput(root, ".angle-a-wrap", A, centroid, width, height);
        placeAngleInput(root, ".angle-b-wrap", B, centroid, width, height);
        placeAngleInput(root, ".angle-c-wrap", C, centroid, width, height);
    };

    const triangleType = (triangle, strings) => {
        const sides = [triangle.a, triangle.b, triangle.c].sort((a, b) => a - b);
        let bySides = strings.scalene;
        if (Math.abs(sides[0] - sides[2]) < 0.00001) {
            bySides = strings.equilateral;
        } else if (Math.abs(sides[0] - sides[1]) < 0.00001 || Math.abs(sides[1] - sides[2]) < 0.00001) {
            bySides = strings.isosceles;
        }
        const maxAngle = Math.max(triangle.A, triangle.B, triangle.C);
        const byAngles = Math.abs(maxAngle - 90) < 0.0001 ?
            strings.right : maxAngle > 90 ? strings.obtuse : strings.acute;
        return `${bySides}, ${byAngles}`;
    };

    const renderResults = (root, triangle, solutionsCount, strings) => {
        const semiperimeter = (triangle.a + triangle.b + triangle.c) / 2;
        const areaSquared = semiperimeter * (semiperimeter - triangle.a) *
            (semiperimeter - triangle.b) * (semiperimeter - triangle.c);
        const area = Math.sqrt(Math.max(0, areaSquared));
        const perimeter = triangle.a + triangle.b + triangle.c;
        const heights = {
            ha: 2 * area / triangle.a,
            hb: 2 * area / triangle.b,
            hc: 2 * area / triangle.c,
        };
        const circumradius = triangle.a / (2 * Math.sin(degToRad(triangle.A)));
        const inradius = area / semiperimeter;

        const cards = [
            {label: strings.sidea, value: fmt(triangle.a)},
            {label: strings.sideb, value: fmt(triangle.b)},
            {label: strings.sidec, value: fmt(triangle.c)},
            {label: strings.anglea, value: `${fmt(triangle.A)}°`},
            {label: strings.angleb, value: `${fmt(triangle.B)}°`},
            {label: strings.anglec, value: `${fmt(triangle.C)}°`},
            {label: strings.perimeter, value: fmt(perimeter)},
            {label: strings.semiperimeter, value: fmt(semiperimeter)},
            {label: strings.area, value: fmt(area)},
            {label: strings.heighta, value: fmt(heights.ha)},
            {label: strings.heightb, value: fmt(heights.hb)},
            {label: strings.heightc, value: fmt(heights.hc)},
            {label: strings.inradius, value: fmt(inradius)},
            {label: strings.circumradius, value: fmt(circumradius)},
            {label: strings.classification, value: triangleType(triangle, strings)},
        ];

        const calculations = [
            `${strings.anglesum}: ${fmt(triangle.A)}° + ${fmt(triangle.B)}° + ${fmt(triangle.C)}° = 180°`,
            `${strings.perimeter}: P = a + b + c = ${fmt(triangle.a)} + ${fmt(triangle.b)} + ${fmt(triangle.c)} = ${fmt(perimeter)}`,
            `${strings.semiperimeter}: s = P / 2 = ${fmt(perimeter)} / 2 = ${fmt(semiperimeter)}`,
            `${strings.heron}: ${strings.area} = √[s(s-a)(s-b)(s-c)] = ${fmt(area)}`,
            `${strings.lawofsines}: a/sin(A) = b/sin(B) = c/sin(C) = ${fmt(2 * circumradius)}`,
            `${strings.lawofcosines}: a² = b² + c² - 2bc·cos(A)`,
            `hₐ = 2·${strings.area}/a = ${fmt(heights.ha)}; hᵦ = ${fmt(heights.hb)}; h꜀ = ${fmt(heights.hc)}`,
            `r = ${strings.area}/s = ${fmt(inradius)}; R = a/[2·sin(A)] = ${fmt(circumradius)}`,
        ];
        if (solutionsCount > 1) {
            calculations.unshift(strings.ssaambiguous.replace("__COUNT__", String(solutionsCount)));
        }

        const context = {
            resultstitle: strings.results,
            calculationstitle: strings.calculations,
            cards,
            calculationrows: calculations.map(text => ({text})),
        };

        Templates.renderForPromise("mod_triangle/results", context)
            .then(({html, js: templatejs}) => {
                Templates.replaceNodeContents(root.querySelector(".triangle-rendered"), html, templatejs);
                root.querySelector(".triangle-output").hidden = false;
            })
            .catch(Notification.exception);
    };

    const hideResults = root => {
        root.querySelector(".triangle-output").hidden = true;
        root.querySelector(".triangle-rendered").textContent = "";
    };

    const setMessage = (root, text, type) => {
        const message = root.querySelector(".triangle-message");
        message.textContent = text;
        message.className = `triangle-message alert alert-${type}`;
    };

    const recalculate = (root, manual, strings) => {
        updateBounds(root, manual);
        const known = getKnown(root, manual);
        const knownFields = FIELDS.filter(field => Number.isFinite(known[field]));
        const hasSide = SIDES.some(field => Number.isFinite(known[field]));

        if (knownFields.length < 3 || !hasSide) {
            clearComputedValues(root, manual);
            drawTriangle(root, null);
            hideResults(root);
            setMessage(root, root.dataset.waiting, "info");
            return;
        }

        const invalidNative = FIELDS.some(field => {
            const input = root.querySelector(`[data-field="${field}"]`);
            return manual[field] && !input.checkValidity();
        });
        if (invalidNative) {
            clearComputedValues(root, manual);
            hideResults(root);
            setMessage(root, strings.invalidrange, "danger");
            return;
        }

        const solutions = solve(known);
        if (!solutions.length) {
            clearComputedValues(root, manual);
            hideResults(root);
            setMessage(root, strings.invalidtriangle, "danger");
            return;
        }

        const triangle = solutions[0];
        setComputedValues(root, manual, triangle);
        drawTriangle(root, triangle);
        renderResults(root, triangle, solutions.length, strings);
        const success = solutions.length > 1 ?
            strings.successmultiple.replace("__COUNT__", String(solutions.length)) :
            strings.successmethod.replace("__METHOD__", triangle.method);
        setMessage(root, success, "success");
    };

    const init = (id, strings) => {
        const root = document.getElementById(id);
        if (!root) {
            return;
        }
        const manual = {};
        FIELDS.forEach(field => manual[field] = false);

        root.querySelectorAll(".triangle-input").forEach(input => {
            input.addEventListener("input", () => {
                const field = input.dataset.field;
                manual[field] = input.value.trim() !== "";
                input.classList.remove("triangle-calculated");
                recalculate(root, manual, strings);
            });
        });

        root.querySelector(".triangle-clear").addEventListener("click", () => {
            FIELDS.forEach(field => {
                manual[field] = false;
                const input = root.querySelector(`[data-field="${field}"]`);
                input.value = "";
                input.classList.remove("triangle-calculated");
            });
            recalculate(root, manual, strings);
        });

        drawTriangle(root, null);
        updateBounds(root, manual);
    };

    return {init};
});
