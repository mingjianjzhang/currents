class SnapshotNode < ActiveRecord::Base
  belongs_to :content_node
  belongs_to :snapshot

  
end
 