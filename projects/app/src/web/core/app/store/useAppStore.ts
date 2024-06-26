import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { getMyApps, getModelById, putAppById } from '@/web/core/app/api';
import { defaultApp } from '../constants';
import type { AppUpdateParams } from '@/global/core/app/api.d';
import { AppDetailType, AppListItemType } from '@fastgpt/global/core/app/type.d';
import { PostPublishAppProps } from '@/global/core/app/api';
import { postPublishApp } from '../versionApi';

type State = {
  myApps: AppListItemType[];
  loadMyApps: (init?: boolean) => Promise<AppListItemType[]>;
  appDetail: AppDetailType;
  loadAppDetail: (id: string, init?: boolean) => Promise<AppDetailType>;
  updateAppDetail(appId: string, data: AppUpdateParams): Promise<void>;
  publishApp(appId: string, data: PostPublishAppProps): Promise<void>;
  clearAppModules(): void;
  setAppDetail(data: AppDetailType): void;
};

export const useAppStore = create<State>()(
  devtools(
    persist(
      immer((set, get) => ({
        myApps: [],
        async loadMyApps(init = true) {
          if (get().myApps.length > 0 && !init) return [];
          const res = await getMyApps();
          set((state) => {
            state.myApps = res;
          });
          return res;
        },
        appDetail: defaultApp,
        async loadAppDetail(id: string, init = false) {
          if (id === get().appDetail._id && !init) return get().appDetail;

          const res = await getModelById(id);
          set((state) => {
            state.appDetail = res;
          });
          return res;
        },
        async updateAppDetail(appId: string, data: AppUpdateParams) {
          await putAppById(appId, data);
          set((state) => {
            state.appDetail = {
              ...state.appDetail,
              ...data,
              modules: data?.nodes || state.appDetail.modules
            };
          });
        },
        async publishApp(appId: string, data: PostPublishAppProps) {
          await postPublishApp(appId, data);
          set((state) => {
            state.appDetail = {
              ...state.appDetail,
              ...data,
              modules: data?.nodes || state.appDetail.modules
            };
          });
        },
        setAppDetail(data: AppDetailType) {
          set((state) => {
            state.appDetail = data;
          });
        },

        clearAppModules() {
          set((state) => {
            state.appDetail = {
              ...state.appDetail,
              modules: []
            };
          });
        }
      })),
      {
        name: 'appStore',
        partialize: (state) => ({})
      }
    )
  )
);
