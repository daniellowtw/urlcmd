import { TimestampCommand } from './timestamp';
import { TranslateCommand } from './translate';
import { NotepadCommand } from './notepad';
import { Command } from '../command';

export const baseCommands: { [key: string]: Command } = {
    "secs": TimestampCommand,
    "tr": TranslateCommand,
    "notepad": NotepadCommand,
};
