class TimelinesController < ApplicationController
  before_action :require_login, only: [:dashboard]
  before_action :require_correct_user, only: [:dashboard]
  def index
    @timelines = Timeline.limit(5)
  end
  def home 
    @timelines = Timeline.all
  end

  def dashboard
  	@user = current_user
    @user_timelines = User.find(@user.id).timelines
    @admin = Admin.where(user_id: @user.id, )
    if @admin.first
      @admin_timelines = @admin.first.timelines

    end 
    @timeline = Timeline.find(2)
    @contents = ContentNode.this_month(@timeline.id)
    # render json: @user_timelines_content
  end 

  def new

  end

  def create
  	timeline = Timeline.new(timeline_params)
  	if timeline.save
  	  TimelineAdmin.add_admin session[:user_id], timeline.id, 1
  	  redirect_to :back, notice: "You have successfully created a timeline"
  	else
  	  redirect_to :back, alert: timeline.errors.full_messages
  	end
  end

  def show 
  	@timeline = Timeline.find(params[:id])
    @is_admin = @timeline.admins.where(user_id: session[:user_id]).first
    @is_subscriber = @timeline.users.where(id: session[:user_id]).first
  	@contents = ContentNode.everything(@timeline.id)
    @keywords = Tag.where(timeline_id: @timeline.id)
    # @categories = Category.all
    # @sources = Source.all
    
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

  def css_test
    @timeline = Timeline.find(params[:id])
    @contents = ContentNode.everything(@timeline.id)
    @keywords = Tag.where(timeline_id: @timeline.id)
    render "test"
  end

  def display_timeline_keywords
    @timeline = Timeline.find(params[:id])
    @contents = ContentNode.by_keywords @timeline.id, params[:keywords], params[:logic]
    if @contents == [] 
      render text: "Sorry, there were no matches for your search"
    else 
      render partial: "timelines/partials/clutser_timeline"
    end
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
 