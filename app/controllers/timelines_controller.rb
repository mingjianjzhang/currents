class TimelinesController < ApplicationController
  def dashboard
  	@user = current_user
  end

  def new

  end

  def create
  	timeline = Timeline.new(timeline_params)
  	if timeline.save
  	  TimelineAdmin.add_admin session[:user_id], timeline.id
  	  redirect_to :back, notice: "You have successfully created a timeline"
  	else
  	  redirect_to :back, alert: timeline.errors.full_messages
  	end
  end

  def show 
  	@timeline = Timeline.find(params[:id])
  	@contents = ContentNode.everything(@timeline.id)
    @keywords = Tag.all
  end

  def display_timeline
    @timeline = Timeline.find(params[:id])
  	if params[:scope] == "1"
  		@contents = ContentNode.this_month(params[:id])
    elsif params[:scope] == "2"
    	@contents = ContentNode.last_six(params[:id])
    elsif params[:scope] == "3"
    	@contents = ContentNode.last_two_years(params[:id])
    elsif params[:scope] == "4"
    	@contents = ContentNode.everything(params[:id])
    elsif params[:scope].length > 2
      @contents = ContentNode.by_keyword(params[:id], params[:scope])
    end 
    # render json: @snapshots
  	render partial: "timelines/partials/clutser_timeline"
  end

  def display_timeline_keywords
    @timeline = Timeline.find(params[:id])
    render json: params
  end 

  def display_timeline_date_range
    @timeline = Timeline.find(params[:id])
    @contents = ContentNode.by_date_range @timeline.id, params[:begin_date], params[:end_date]
    render partial: "timelines/partials/clutser_timeline"
  end
  def manage 
  	@timelines = Admin.where(user_id: params[:id]).take.timelines
  end
  def my_timelines
  	@timelines = User.find(params[:id]).timelines
  end
  private
  def timeline_params
  	params.require(:timeline).permit(:title)
  end	
end
 