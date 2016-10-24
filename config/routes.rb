Rails.application.routes.draw do

  root 'sessions#login'

  get 'dashboard/:id' => 'timelines#dashboard'

 
  post 'subscribe' => 'users#subscribe'
  get 'timeline/new' => 'timelines#new'
  get 'snapshot/new' => 'snapshots#new'
  get 'content/new' => 'content_nodes#new' 
  post 'display_timeline/:id' => 'timelines#display_timeline'
  get "timeline/manage/:id" => 'timelines#manage'
  get 'timeline/:id' => 'timelines#show'
  get 'timeline/:t_id/snapshots/:s_id' => 'snapshots#show'
  get 'my_timelines/:id' => 'timelines#my_timelines'

  post 'date_query/:id' => 'timelines#display_timeline_date_range'
  post 'tag_query/:id' => 'timelines#display_timeline_keywords'
  post 'timelines' => 'timelines#create'
  post 'snapshots' => 'snapshots#create'
  post 'contents' => 'content_nodes#create'
  post 'sources' => 'sources#create'
  post 'tags' => 'tags#create'

  post 'users' => 'users#create'
  post 'login' => 'sessions#login_user'
  delete 'logout' => 'sessions#logout'
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'
 
  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
