class AddTimelineRefToTags < ActiveRecord::Migration
  def change
    add_reference :tags, :timeline, index: true
    add_foreign_key :tags, :timelines
  end
end
