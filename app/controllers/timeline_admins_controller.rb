class TimelineAdminsController < ApplicationController
	def handle_request
	  TimelineUser.where(timeline_id: params[:timeline_id], user_id: params[:user_id]).first.update(request: 1)
	  redirect_to :back
	end
	def add_admin
	  TimelineAdmin.add_admin(params[:user_id], params[:timeline_id], params[:status])
	  redirect_to :back
	end
	def messages
		@messages = TimelineUser.where(timeline_id: params[:id], request: 1).includes(:user)
		render partial: "shared/admin_requests"
	end
end
