import {Params} from "@angular/router";
import {ActiveParams} from "../../../types/active-params";

export class ActiveParamsUtil {
  static processParams(params: Params): ActiveParams {
    const activeParams: ActiveParams = {categories: []};

    if (params.hasOwnProperty('page') && params['page'] !== null) {
      const pageValue = parseInt(params['page'], 10);
      activeParams.page = isNaN(pageValue) ? undefined : pageValue;
    }

    return activeParams;
  }
}
