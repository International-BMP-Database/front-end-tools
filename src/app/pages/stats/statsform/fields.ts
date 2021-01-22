
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Injectable } from '@angular/core';
import { SharedFields } from 'src/app/core/services/sharedfields';
import { Remotedata } from '@core/remotedata';
import { Subject, from } from 'rxjs';
import { takeUntil, startWith, tap } from 'rxjs/operators';

@Injectable()
export class FormFields extends SharedFields {
    selectionFormFields: FormlyFieldConfig[] = [
        {
            key: 'pollutantCategory',
            type: 'select',
            className: 'flex-1 col',
            templateOptions: {
                // interface: 'popover',
                labelPosition: 'floating',
                placeholder: 'Select Parameter Group',
                multiple: false,
                type: 'text',
                label: 'Parameter Group',
                options: from(this.dataService.getCatDropDownOpts('pollutantTypes')),
                valueProp: 'category',
                labelProp: 'category',
                // required: true
            }
        }, {
            key: 'parameter',
            // type: 'gsselect',
            type: 'select',
            className: 'flex-1 col gsselect secondary-filter',
            hideExpression: '!model.pollutantCategory',
            templateOptions: {
                labelPosition: 'stacked',
                placeholder: 'Select Parameter',
                interface: 'popover',
                multiple: false,
                type: 'text',
                label: 'Parameter',
                options: [],
                valueProp: 'value',
                labelProp: 'value',
                required: true,
            },
            hooks: {
                onInit: (field) => {
                    const form = field.parent.formControl;
                    form.get('pollutantCategory').valueChanges.pipe(
                        takeUntil(this.onDestroy$),
                        startWith(form.get('pollutantCategory').value),
                        // tap(async (cat: string[]) => {
                        tap(async (cat: string) => {
                            if (cat) {
                                field.formControl.setValue(null);
                                field.templateOptions.options = await this.dataService.getTypeForCategory('pollutantTypes', [cat]);
                            }
                        }),
                    ).subscribe();
                },
            }
        },
        {
            key: 'bmpCategory',
            type: 'select',
            className: 'flex-1 col',
            templateOptions: {
                // interface: 'popover',
                labelPosition: 'stacked',
                placeholder: 'Select BMP Category',
                multiple: true,
                type: 'text',
                label: 'BMP Category',
                options: from(this.dataService.getCatDropDownOpts('bmpTypes')),
                valueProp: 'category',
                labelProp: 'category',
                // required: true
            },
            hooks: {
                onInit: (field) => {
                    const form = field.parent.formControl;
                    // form.get('parameter').valueChanges.pipe( // parameter control
                    // hidden intially so null use pollutantCategory group instead
                    form.get('pollutantCategory').valueChanges.pipe(
                        takeUntil(this.onDestroy$),
                        startWith(form.get('pollutantCategory').value),
                        tap(async () => {
                            setTimeout(() => {
                                if (form.get('parameter')) {
                                    // subscribe to parameter control after it is shown
                                    form.get('parameter').valueChanges.pipe(
                                        takeUntil(this.onDestroy$),
                                        startWith(form.get('parameter').value),
                                        tap(async (param: string) => {
                                            // field.formControl.setValue(null);
                                            if (param) {
                                                field.templateOptions.options =
                                                    await this.dataService.fetchFilteredFormMetaData('bmpTypes', param);
                                            }
                                        }),
                                    ).subscribe();
                                }
                            }, 0);


                        }),
                    ).subscribe();
                },
            }
        },
        {
            key: 'siteType',
            type: 'select',
            className: 'flex-1 col',
            // hideExpression: '!model.parameter',
            templateOptions: {
                labelPosition: 'stacked',
                // interface: 'popover',
                placeholder: 'Select Site Type',
                multiple: true,
                type: 'number',
                label: 'Site Type',
                options: from(this.dataService.getCatDropDownOpts('siteTypes')),
                valueProp: 'label',
                labelProp: 'label',
                // required: true
            },
            hooks: {
                onInit: (field) => {
                    const form = field.parent.formControl;
                    // form.get('parameter').valueChanges.pipe( // parameter control
                    // hidden intially so null use pollutantCategory group instead
                    form.get('pollutantCategory').valueChanges.pipe(
                        takeUntil(this.onDestroy$),
                        startWith(form.get('pollutantCategory').value),
                        tap(async () => {
                            setTimeout(() => {
                                if (form.get('parameter')) {
                                    // subscribe to parameter control after it is shown
                                    form.get('parameter').valueChanges.pipe(
                                        takeUntil(this.onDestroy$),
                                        startWith(form.get('parameter').value),
                                        tap(async (param: string) => {
                                            // field.formControl.setValue(null);
                                            if (param) {
                                                field.templateOptions.options =
                                                    await this.dataService.fetchFilteredFormMetaData('siteTypes', param);
                                            }
                                        }),
                                    ).subscribe();
                                }
                            }, 0);
                        }),
                    ).subscribe();
                },
            }
        }, {
            key: 'epaRainZone',
            type: 'select',
            className: 'flex-1 col',
            templateOptions: {
                labelPosition: 'stacked',
                // interface: 'popover',
                placeholder: 'Select EPA Rain Zone',
                multiple: true,
                type: 'text',
                label: 'EPA Rain Zone (see Help page for map)',
                options: from(this.dataService.getCatDropDownOpts('epazones')),
                valueProp: 'zone',
                labelProp: 'zone',
                // required: true
            },
            hooks: {
                onInit: (field) => {
                    const form = field.parent.formControl;
                    // form.get('parameter').valueChanges.pipe( // parameter control
                    // hidden intially so null use pollutantCategory group instead
                    form.get('pollutantCategory').valueChanges.pipe(
                        takeUntil(this.onDestroy$),
                        startWith(form.get('pollutantCategory').value),
                        tap(async () => {
                            setTimeout(() => {
                                if (form.get('parameter')) {
                                    // subscribe to parameter control after it is shown
                                    form.get('parameter').valueChanges.pipe(
                                        takeUntil(this.onDestroy$),
                                        startWith(form.get('parameter').value),
                                        tap(async (param: string) => {
                                            if (param) {
                                                field.templateOptions.options =
                                                    await this.dataService.fetchFilteredFormMetaData('epazones', param);
                                            }
                                        }),
                                    ).subscribe();
                                }
                            }, 0);
                        }),
                    ).subscribe();
                },
            }
        }, {
            key: 'aadt',
            type: 'dualrange',
            // hideExpression: '!model.parameter',
            templateOptions: {
                disabled: true,
                mode: 'ios',
                label: 'AADT',
                placeholder: 'AADT',
                description: 'Average Annual Daily Trafffic',
                // required: true,
                min: 0, max: 100000,
                step: 2000,
                dualKnobs: true,
                snaps: false,
                ticks: false,
                color: 'primary',
                defaultLow: 0,
                defaultHi: 100000,
            }/*,
            expressionProperties: {
                'templateOptions.disabled': 'model.disableAADT',
            },*/
        },

    ];

    constructor(private dataService: Remotedata, private onDestroy$: Subject<void>) {
        super();
    }
}


