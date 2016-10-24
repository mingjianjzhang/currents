class ContentNodesController < ApplicationController
  def new
    @categories = Category.all
    @sources = Source.all 
    @tags = Tag.all
  end

  def create
    params.permit!
  	content = ContentNode.new(content_nodes_params)
  	if content.save
      ContentTag.create(content_node_id: content.id, tag_id: params[:tagsS])
      TimelineContent.create(content_node_id: content.id, timeline_id: 2)
  	  redirect_to :back, notice: "You have successfully added a piece of content"
  	else
      redirect_to :back, alert: content.errors.full_messages
    end
  end
  private
  def content_nodes_params
  	params.require(:content_nodes).permit(:title, :link, :description, :category_id, :source_id, :day)
  end
  def snapshot_nodes_params
  	params.require(:snapshot_nodes).permit(:content_node_id, :snapshot_id)
  end
end

