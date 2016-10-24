class TimelineContent < ActiveRecord::Base
  belongs_to :content_node
  belongs_to :timeline

  def self.test
  	for i in 1..12
      self.create(content_node_id: i, timeline_id: 2)
  	end
  end
end
