import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { MapService } from '../map.service';
import { Shared } from '@core/shared';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { StatsService } from '@pages/stats/stats.service';

export interface ParamsGroup {
  paramGroup: string;
  params: string[];
}

export const statsFilter = (opt: string[], value: string): string[] => {
  const filterValue = value.toLowerCase();

  return opt.filter((item) => item.toLowerCase().indexOf(filterValue) === 0);
};

@Component({
  selector: 'app-bigmap',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {
  /** Reference to the autocomplete trigger. */

  @ViewChild('mapElementRef') mapElementRef: ElementRef;

  map: any;
  public statsForm: FormGroup = null;
  public statsParam = new FormControl();
  public statsParamGroupOptions$: Observable<ParamsGroup[]>;
  public owner: 'dot' | 'bmpdatabase' = 'dot';
  constructor(
    private route: ActivatedRoute,

    public fb: FormBuilder,
    public shared: Shared,
    public engine: MapService
  ) {
    console.log('Hello from MapComponent');
    this.route.queryParams.subscribe((params) => {
      console.log(params);
      this.owner = params && params.owner ? params.owner : 'dot';
    });
  }

  ngOnInit() {
    this.statsForm = this.fb.group({
      statsParam: '',
    });
    this.statsParamGroupOptions$ = this.statsForm.get('statsParam').valueChanges.pipe(
      startWith(''),
      map((value) => {
        console.log('inside value changes value->', value);
        return this._filterGroup(value);
      })
    );
  }

  public ngAfterViewInit() {
    this.engine.createMap({
      mapElementRef: this.mapElementRef,
    });
  }

  private _filterGroup(value: string): ParamsGroup[] {
    if (value && this.engine && this.engine.selectedSite) {
      if (this.engine.selectedSite.cleanParams) {
        return this.engine.selectedSite.cleanParams
          .map((group) => ({
            paramGroup: group.paramGroup,
            params: statsFilter(group.params, value),
          }))
          .filter((group) => group.params.length > 0);
      }
    }
    if (this.engine && this.engine.selectedSite && this.engine.selectedSite.cleanParams) {
      return this.engine.selectedSite.cleanParams;
    }
    return [];
  }

  statsParamOptionSelectH(event: any) {
    /* if (!event.option) { return; }
     const input = event.source;
     const value = event.option.value;*/
    // not needed used as workaround for this issue https://github.com/angular/components/issues/8214
  }

  statsParamonSelectionChangeH(event: any, paramGroup: string, param: string) {
    console.log(event, paramGroup, param);

    if (event.source.selected) {
      // pass selected site to stats engine
      this.engine.selectedSite.paramGroup = [paramGroup]; // allows multi selection
      this.engine.selectedSite.param = param;
      this.shared.selectedSite = this.engine.selectedSite;
      this.shared.selectedSite.owner = this.owner;
      this.closePopUp();
      // go to stats page
      this.shared.navigateToUrl('/stats/maplink_stats');
    }
  }

  public openInNewTab(url) {
    this.shared.openInNewTab(url);
  }

  public closePopUp() {
    console.log('close clicked');
    this.engine.closePopUp();
    return false; // important so x link not followed to reload page
  }

  public async accessFormsH(feat) {
    console.log('access forms clicked');

    return false;
  }
}
