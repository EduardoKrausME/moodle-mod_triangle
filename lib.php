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
 * lib.php
 *
 * @package   mod_triangle
 * @copyright 2026 Eduardo Kraus {@link https://eduardokraus.com}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * triangle_supports
 *
 * @param string $feature
 * @return bool|null
 */
function triangle_supports(string $feature) {
    return match ($feature) {
        FEATURE_MOD_INTRO => true,
        FEATURE_SHOW_DESCRIPTION => true,
        FEATURE_COMPLETION_TRACKS_VIEWS => true,
        FEATURE_BACKUP_MOODLE2 => false,
        default => null,
    };
}

/**
 * triangle_add_instance
 *
 * @param stdClass $data
 * @param moodleform|null $mform
 * @return int
 * @throws dml_exception
 */
function triangle_add_instance(stdClass $data, ?moodleform $mform = null): int {
    global $DB;

    $data->timemodified = time();
    return $DB->insert_record("triangle", $data);
}

/**
 * triangle_update_instance
 *
 * @param stdClass $data
 * @param moodleform|null $mform
 * @return bool
 * @throws dml_exception
 */
function triangle_update_instance(stdClass $data, ?moodleform $mform = null): bool {
    global $DB;

    $data->id = $data->instance;
    $data->timemodified = time();
    return $DB->update_record("triangle", $data);
}

/**
 * triangle_delete_instance
 *
 * @param int $id
 * @return bool
 * @throws dml_exception
 */
function triangle_delete_instance(int $id): bool {
    global $DB;

    if (!$DB->record_exists("triangle", ["id" => $id])) {
        return false;
    }

    $DB->delete_records("triangle", ["id" => $id]);
    return true;
}
