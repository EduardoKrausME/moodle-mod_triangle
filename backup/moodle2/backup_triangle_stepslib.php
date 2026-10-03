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
 * Backup structure for mod_triangle.
 *
 * @package    mod_triangle
 * @category   backup
 * @copyright  2026 Eduardo Kraus {@link https://eduardokraus.com}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Defines the complete triangle activity structure for backup.
 */
class backup_triangle_activity_structure_step extends backup_activity_structure_step {
    /**
     * Defines the backup structure.
     *
     * @return backup_nested_element
     */
    protected function define_structure() {
        $triangle = new backup_nested_element('triangle', ['id'], [
            'name',
            'intro',
            'introformat',
            'timemodified',
        ]);

        $triangle->set_source_table('triangle', ['id' => backup::VAR_ACTIVITYID]);
        $triangle->annotate_files('mod_triangle', 'intro', null);

        return $this->prepare_activity_structure($triangle);
    }
}
