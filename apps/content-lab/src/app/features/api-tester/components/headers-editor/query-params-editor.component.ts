import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QueryParam } from '../../models/request.model';

@Component({
  selector: 'app-query-params-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './query-params-editor.component.html',
  styleUrls: ['./query-params-editor.component.scss']
})
export class QueryParamsEditorComponent {
  @Input() params: QueryParam[] = [];
  @Output() paramsChange = new EventEmitter<QueryParam[]>();

  addParam(): void {
    const newParams = [...this.params, { key: '', value: '', enabled: true }];
    this.paramsChange.emit(newParams);
  }

  removeParam(index: number): void {
    const newParams = this.params.filter((_, i) => i !== index);
    this.paramsChange.emit(newParams);
  }

  updateParam(index: number, field: 'key' | 'value' | 'enabled', value: any): void {
    const newParams = [...this.params];
    newParams[index] = { ...newParams[index], [field]: value };
    this.paramsChange.emit(newParams);
  }
}
