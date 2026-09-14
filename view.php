<?php
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
 * view.php
 *
 * @package   mod_triangle
 * @copyright 2026 Eduardo Kraus {@link https://eduardokraus.com}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(__DIR__ . "/../../config.php");

$id = required_param("id", PARAM_INT);
$cm = get_coursemodule_from_id("triangle", $id, 0, false, MUST_EXIST);
$course = get_course($cm->course);
$triangle = $DB->get_record("triangle", ["id" => $cm->instance], "*", MUST_EXIST);

require_login($course, true, $cm);
$context = context_module::instance($cm->id);
require_capability("mod/triangle:view", $context);

$PAGE->set_url("/mod/triangle/view.php", ["id" => $cm->id]);
$PAGE->set_title(format_string($triangle->name));
$PAGE->set_heading(format_string($course->fullname));
$PAGE->set_context($context);

$completion = new completion_info($course);
$completion->set_module_viewed($cm);

$PAGE->requires->js_call_amd("mod_triangle/calculator", "init", ["triangle-calculator-{$cm->id}"]);

$data = [
    "id" => "triangle-calculator-{$cm->id}",
    "sidea" => get_string("sidea", "mod_triangle"),
    "sideb" => get_string("sideb", "mod_triangle"),
    "sidec" => get_string("sidec", "mod_triangle"),
    "anglea" => get_string("anglea", "mod_triangle"),
    "angleb" => get_string("angleb", "mod_triangle"),
    "anglec" => get_string("anglec", "mod_triangle"),
    "hint" => get_string("hint", "mod_triangle"),
    "waiting" => get_string("waiting", "mod_triangle"),
    "clear" => get_string("clear", "mod_triangle"),
    "results" => get_string("results", "mod_triangle"),
    "calculations" => get_string("calculations", "mod_triangle"),
];

echo $OUTPUT->header();
echo $OUTPUT->heading(format_string($triangle->name));

if (trim($triangle->intro) !== "") {
    echo $OUTPUT->box(format_module_intro("triangle", $triangle, $cm->id), "generalbox mod_introbox", "triangleintro");
}

echo $OUTPUT->render_from_template("mod_triangle/calculator", $data);
echo $OUTPUT->footer();
