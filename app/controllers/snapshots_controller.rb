class SnapshotsController < ApplicationController
  def new
  end

  def show
  	@snapshot = Timeline.find(params[:t_id]).snapshots.find(params[:s_id])
  	@categories = Category.all
  	@content = @snapshot.content_nodes
  end
  def create
  	snapshot = Snapshot.new(snapshot_params)
  	if snapshot.save
  	  flash[:notice] = "You have successfully created a snapshot"
  	  redirect_to :back
  	else
  	  flash[:alert] = snapshot.errors.full_messages
  	  redriect_to :back
  	end
  end
  private
  def snapshot_params
  	params.require(:snapshot).permit(:title, :day, :timeline_id)
  end

end
 