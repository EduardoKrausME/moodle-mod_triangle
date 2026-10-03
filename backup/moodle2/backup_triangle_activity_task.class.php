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
 * Backup task for mod_triangle.
 *
 * @package    mod_triangle
 * @category   backup
 * @copyright  2026 Eduardo Kraus {@link https://eduardokraus.com}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/mod/triangle/backup/moodle2/backup_triangle_stepslib.php');

/**
 * Provides the steps to back up one triangle calculator activity.
 */
class backup_triangle_activity_task extends backup_activity_task {
    /**
     * No activity-specific backup settings.
     *
     * @return void
     */
    protected function define_my_settings() {
    }

    /**
     * Defines the activity backup steps.
     *
     * @return void
     */
    protected function define_my_steps() {
        $this->add_step(new backup_triangle_activity_structure_step('triangle_structure', 'triangle.xml'));
    }

    /**
     * Encodes links to this activity before backup.
     *
     * @param string $content HTML content.
     * @return string
     */
    public static function encode_content_links($content) {
        global $CFG;

        $base = preg_quote($CFG->wwwroot, '/');

        $search = '/(' . $base . '\/mod\/triangle\/index.php\?id\=)([0-9]+)/';
        $content = preg_replace($search, '$@TRIANGLEINDEX*$2@$', $content);

        $search = '/(' . $base . '\/mod\/triangle\/view.php\?id\=)([0-9]+)/';
        return preg_replace($search, '$@TRIANGLEVIEWBYID*$2@$', $content);
    }
}
