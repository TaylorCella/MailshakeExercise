import {
  AfterViewInit,
  Directive,
  DoCheck,
  Host,
  Optional,
  Renderer2,
  Self,
  ViewContainerRef,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';

@Directive({
  selector: '[appStylePaginator]',
})
export class StylePaginatorDirective implements AfterViewInit, DoCheck {
  public directiveLoaded = false;
  constructor(
    @Host() @Self() @Optional() private readonly matPag: MatPaginator,
    private readonly vr: ViewContainerRef,
    private readonly ren: Renderer2,
  ) {}

  private createPage(): any {
    const input = this.ren.createElement('input');
    this.ren.setAttribute(input, 'placeholder', 'Enter page number');
    this.ren.setProperty(input, 'matInput', 'matInput');

    this.ren.listen(input, 'keyup.enter', event => {
      this.ren.setValue(input, event.target.value);
      this.switchPage(event.target.value);
    })
    
    return input;
  }

  private initPageRange(): void {
    const pagingContainerMain = this.vr.element.nativeElement.querySelector('.mat-paginator-range-actions');
    // const peopleCount = this.ren.createElement('span');
    // const peopleText = this.ren.createText(this.matPag.length + 'people');
    // this.ren.appendChild(peopleCount, peopleText);
    // this.ren.insertBefore(pagingContainerMain, peopleCount, this.vr.element.nativeElement.childNodes[0].childNodes[0].childNodes[1].childNodes[0]);

    if (
      this.vr.element.nativeElement.querySelector('div.mat-paginator-range-actions div.btn_custom-paging-container')
    ) {
      this.ren.removeChild(
        pagingContainerMain,
        this.vr.element.nativeElement.querySelector('div.mat-paginator-range-actions div.btn_custom-paging-container'),
      );
    }

    const pagingContainerBtns = this.ren.createElement('div');
    const refNode = this.vr.element.nativeElement.childNodes[0].childNodes[0].childNodes[1].childNodes[5];

    this.ren.addClass(pagingContainerBtns, 'btn_custom-paging-container');
    this.ren.insertBefore(pagingContainerMain, pagingContainerBtns, refNode);

    const pageRange = this.vr.element.nativeElement.querySelector(
      'div.mat-paginator-range-actions div.btn_custom-paging-container',
    );
    pageRange.innerHtml = '';


    this.ren.insertBefore(pageRange, this.createPage(), null);
    const pageCount = this.pageCount(this.matPag.length, this.matPag.pageSize);
    
    const span = this.ren.createElement('span');
    const text = this.ren.createText(' of '+ pageCount);
    
    this.ren.appendChild(span, text);
    this.ren.insertBefore(pageRange, span, null);
  }

  private pageCount(length: number, pageSize: number): number {
    return Math.floor(length / pageSize) + 1;
  }

  private switchPage(value: number): void {
    this.matPag.pageIndex = value - 1,
    this.matPag.page.next({
      pageIndex: value,
      pageSize: this.matPag.pageSize,
      length: this.matPag.length
    });
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      this.directiveLoaded = true;
    }, 500);
  }

  public ngDoCheck() {
    if (this.directiveLoaded) {
      this.initPageRange();
    }
  }
}
