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
        placeholder: 'Select',
        multiple: false,
        type: 'text',
        label: 'Parameter Group',
        options: from(this.dataService.getCatDropDownOpts('pollutantTypes')),
        valueProp: 'category',
        labelProp: 'category',
      },
    },
    {
      key: 'parameter',
      type: 'gsselect',
      className: 'flex-1 col gsselect secondary-filter',
      hideExpression: '!model.pollutantCategory',
      templateOptions: {
        placeholder: 'Select',
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
          form
            .get('pollutantCategory')
            .valueChanges.pipe(
              takeUntil(this.onDestroy$),
              startWith(form.get('pollutantCategory').value),
              tap(async (cat: string) => {
                if (cat) {
                  field.formControl.setValue(null);
                  field.templateOptions.options = await this.dataService.getTypeForCategory(
                    'pollutantTypes',
                    [cat]
                  );
                }
              })
            )
            .subscribe();
        },
      },
    },
    {
      key: 'bmpCategory',
      type: 'select',
      className: 'flex-1 col',
      templateOptions: {
        // interface: 'popover',
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
          // hidden intially so null use pollutantCategory group instead
          form
            .get('pollutantCategory')
            .valueChanges.pipe(
              takeUntil(this.onDestroy$),
              startWith(form.get('pollutantCategory').value),
              tap(async () => {
                setTimeout(() => {
                  if (form.get('parameter')) {
                    // subscribe to parameter control after it is shown
                    form
                      .get('parameter')
                      .valueChanges.pipe(
                        takeUntil(this.onDestroy$),
                        startWith(form.get('parameter').value),
                        tap(async (param: string) => {
                          if (param) {
                            field.templateOptions.options = await this.dataService.fetchFilteredFormMetaData(
                              'bmpTypes',
                              param
                            );
                          }
                        })
                      )
                      .subscribe();
                  }
                }, 0);
              })
            )
            .subscribe();
        },
      },
    },
    {
      key: 'siteType',
      type: 'select',
      className: 'flex-1 col',
      templateOptions: {
        interface: 'popover',
        multiple: true,
        type: 'number',
        label: 'Site Type',
        options: from(this.dataService.getCatDropDownOpts('siteTypes')),
        valueProp: 'label',
        labelProp: 'label',
      },
      hooks: {
        onInit: (field) => {
          const form = field.parent.formControl;
          // hidden intially so null use pollutantCategory group instead
          form
            .get('pollutantCategory')
            .valueChanges.pipe(
              takeUntil(this.onDestroy$),
              startWith(form.get('pollutantCategory').value),
              tap(async () => {
                setTimeout(() => {
                  if (form.get('parameter')) {
                    // subscribe to parameter control after it is shown
                    form
                      .get('parameter')
                      .valueChanges.pipe(
                        takeUntil(this.onDestroy$),
                        startWith(form.get('parameter').value),
                        tap(async (param: string) => {
                          if (param) {
                            field.templateOptions.options = await this.dataService.fetchFilteredFormMetaData(
                              'siteTypes',
                              param
                            );
                          }
                        })
                      )
                      .subscribe();
                  }
                }, 0);
              })
            )
            .subscribe();
        },
      },
    },
  ];

  constructor(private dataService: Remotedata, private onDestroy$: Subject<void>) {
    super();
  }
}
