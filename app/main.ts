import { EventData, Page } from '@nativescript/core';
import { AppModel } from './main-model';

export function navigatingTo(args: EventData) {
	const page = <Page>args.object;
	page.bindingContext = new AppModel();
}