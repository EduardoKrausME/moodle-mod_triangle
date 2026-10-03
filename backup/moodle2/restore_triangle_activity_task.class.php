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
 * Restore task for mod_triangle.
 *
 * @package    mod_triangle
 * @category   backup
 * @copyright  2026 Eduardo Kraus {@link https://eduardokraus.com}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/mod/triangle/backup/moodle2/restore_triangle_stepslib.php');

/**
 * Provides the settings and steps to restore one triangle calculator activity.
 */
class restore_triangle_activity_task extends restore_activity_task {
    /**
     * No activity-specific restore settings.
     *
     * @return void
     */
    protected function define_my_settings() {
    }

    /**
     * Defines the activity restore steps.
     *
     * @return void
     */
    protected function define_my_steps() {
        $this->add_step(new restore_triangle_activity_structure_step('triangle_structure', 'triangle.xml'));
    }

    /**
     * Defines content fields processed by the link decoder.
     *
     * @return restore_decode_content[]
     */
    public static function define_decode_contents() {
        return [
            new restore_decode_content('triangle', ['intro'], 'triangle'),
        ];
    }

    /**
     * Defines link decoding rules.
     *
     * @return restore_decode_rule[]
     */
    public static function define_decode_rules() {
        return [
            new restore_decode_rule('TRIANGLEVIEWBYID', '/mod/triangle/view.php?id=$1', 'course_module'),
            new restore_decode_rule('TRIANGLEINDEX', '/mod/triangle/index.php?id=$1', 'course'),
        ];
    }

    /**
     * Defines restore rules for activity logs.
     *
     * @return restore_log_rule[]
     */
    public static function define_restore_log_rules() {
        return [
            new restore_log_rule('triangle', 'view', 'view.php?id={course_module}', '{triangle}'),
        ];
    }

    /**
     * Defines restore rules for course-level logs.
     *
     * @return restore_log_rule[]
     */
    public static function define_restore_log_rules_for_course() {
        return [
            new restore_log_rule('triangle', 'view all', 'index.php?id={course}', null),
        ];
    }
}
